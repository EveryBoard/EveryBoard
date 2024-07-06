import { Coord } from 'src/app/jscaip/Coord';
import { MancalaConfig } from './MancalaConfig';
import { MancalaState } from './MancalaState';
import { Player } from 'src/app/jscaip/Player';
import { Table, TableUtils } from 'src/app/jscaip/TableUtils';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPFallible, MGPOptional, MGPValidation, ReversibleMap, Utils } from '@everyboard/lib';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { MancalaDistribution, MancalaMove } from './MancalaMove';
import { ConfigurableRules } from 'src/app/jscaip/Rules';
import { Localized } from 'src/app/utils/LocaleUtils';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { MancalaFailure } from './MancalaFailure';

export interface MancalaCaptureResult {

    captureMap: Table<number>;
    capturedSum: number;
    resultingState: MancalaState;
}

export type MancalaDistributionResult = {

    captureMap: Table<number>;

    capturedSum: number;

    filledCoords: Coord[];

    passedByStoreNTimes: number;

    resultingState: MancalaState;

    endsUpInStore: boolean;
}

export type MancalaDropResult = {

    captureMap: Table<number>;

    capturedSum: number;

    resultingState: MancalaState;
}

export class MancalaNode extends GameNode<MancalaMove, MancalaState> {}

export abstract class MancalaRules<C extends MancalaConfig = MancalaConfig>
    extends ConfigurableRules<MancalaMove, MancalaState, C>
{

    public static readonly FEED_ORIGINAL_HOUSE: Localized = () => $localize`Feed original house`;
    public static readonly MUST_FEED: Localized = () => $localize`Must feed`;
    public static readonly PASS_BY_PLAYER_STORE: Localized = () => $localize`Pass by player store`;
    public static readonly MULTIPLE_SOW: Localized = () => $localize`Must continue distribution after last seed ends in store`;
    public static readonly CYCLICAL_LAP: Localized = () => $localize`Continue distribution until capture or empty house`;
    public static readonly SEEDS_BY_HOUSE: Localized = () => $localize`Seeds by house`;

    // These are the coordinates of the store. These are fake coordinates since the stores are not on the board
    public static FAKE_STORE_COORD: ReversibleMap<Player, Coord> = new ReversibleMap([
        { key: Player.ZERO, value: new Coord(-1, -1) },
        { key: Player.ONE, value: new Coord(+2, +2) },
    ]);

    public static isStarving(player: Player, board: Table<number>): boolean {
        let i: number = 0;
        const playerY: number = player.getOpponent().getValue(); // player 0 has row 1
        while (i < board[0].length) {
            if (board[playerY][i++] > 0) {
                return false; // found some food there, so not starving
            }
        }
        return true;
    }

    public static getEmptyDistributionResult(state: MancalaState): MancalaDistributionResult {
        return {
            capturedSum: 0,
            captureMap: TableUtils.create(state.getWidth(), 2, 0),
            endsUpInStore: false,
            filledCoords: [],
            passedByStoreNTimes: 0,
            resultingState: state,
        };
    }

    public static getInitialState(optionalConfig: MGPOptional<MancalaConfig>): MancalaState {
        const config: MancalaConfig = optionalConfig.get();
        const board: number[][] = TableUtils.create(config.width, 2, config.seedsByHouse);
        return new MancalaState(board, 0, PlayerNumberMap.of(0, 0));
    }

    protected constructor(private readonly capturableValues: number[]) {
        super();
    }

    public override isLegal(move: MancalaMove, state: MancalaState, optionalConfig: MGPOptional<MancalaConfig>)
    : MGPValidation
    {
        const config: MancalaConfig = optionalConfig.get();
        const playerY: number = state.getCurrentPlayerY();
        let canStillPlay: boolean = true;
        for (const distribution of move) {
            Utils.assert(canStillPlay, 'Cannot play after non kalah move');
            const distributionResult: MGPFallible<boolean> = this.isLegalDistribution(distribution, state, config);
            if (distributionResult.isFailure()) {
                return MGPValidation.ofFallible(distributionResult);
            } else {
                const previousDistributionResult: MancalaDistributionResult =
                    MancalaRules.getEmptyDistributionResult(state);
                state =
                    this.distributeHouse(distribution.x, playerY, previousDistributionResult, config).resultingState;
                canStillPlay = distributionResult.get();
            }
        }
        if (config.mustContinueDistributionAfterStore) {
            Utils.assert(canStillPlay === false, 'Must continue playing after kalah move');
        }
        if (config.mustFeed) {
            const opponent: Player = state.getCurrentOpponent();
            const opponentIsStarving: boolean = MancalaRules.isStarving(opponent, state.board);
            const playerDoesEmbargo: boolean = this.canDistribute(state.getCurrentPlayer(), state, config);
            if (opponentIsStarving && playerDoesEmbargo) {
                return MGPValidation.failure(MancalaFailure.SHOULD_DISTRIBUTE());
            }
        }
        return MGPValidation.SUCCESS;
    }

    public override getInitialState(optionalConfig: MGPOptional<MancalaConfig>): MancalaState {
        return MancalaRules.getInitialState(optionalConfig);
    }

    /**
     * If the distribution is illegal, returns a failure including the failure reason
     * If the distribution is legal, return a MGPFallible of a boolean that is true if user can still play
     */
    private isLegalDistribution(distribution: MancalaDistribution, state: MancalaState, config: MancalaConfig)
    : MGPFallible<boolean>
    {
        const playerY: number = state.getCurrentPlayerY();
        if (state.getPieceAtXY(distribution.x, playerY) === 0) {
            return MGPFallible.failure(MancalaFailure.MUST_CHOOSE_NON_EMPTY_HOUSE());
        }
        const distributionResult: MancalaDistributionResult =
            this.distributeMove(MancalaMove.of(distribution), state, config);
        const isStarving: boolean = MancalaRules.isStarving(distributionResult.resultingState.getCurrentPlayer(),
                                                            distributionResult.resultingState.board);
        return MGPFallible.success(distributionResult.endsUpInStore && isStarving === false);
    }

    /**
     * Apply the distribution part of the move.
     * Apply the capture that happened due to distribution (for example the passage in the store).
     * Should not increment the turn of the state.
     */
    public distributeMove(move: MancalaMove, state: MancalaState, config: MancalaConfig): MancalaDistributionResult {
        const player: Player = state.getCurrentPlayer();
        const playerY: number = state.getCurrentPlayerY();
        const filledCoords: Coord[] = [];
        let distributionResult: MancalaDistributionResult = {
            capturedSum: 0,
            captureMap: TableUtils.create(config.width, 2, 0),
            endsUpInStore: false,
            passedByStoreNTimes: 0,
            filledCoords: [],
            resultingState: state,
        };
        for (const distribution of move) {
            let houseToDistribute: Coord = new Coord(distribution.x, playerY);
            let mustDoOneMoreLap: boolean = true;
            while (mustDoOneMoreLap) {
                distributionResult =
                    this.distributeHouse(houseToDistribute.x, houseToDistribute.y, distributionResult, config);
                const captures: PlayerNumberMap = distributionResult.resultingState.getScoresCopy();
                captures.add(player, distributionResult.passedByStoreNTimes);
                filledCoords.push(...distributionResult.filledCoords);
                distributionResult.passedByStoreNTimes += distributionResult.passedByStoreNTimes;
                houseToDistribute = distributionResult.filledCoords[distributionResult.filledCoords.length - 1];
                if (config.continueLapUntilCaptureOrEmptyHouse &&
                    distributionResult.endsUpInStore === false)
                {
                    mustDoOneMoreLap = this.isHouseCapturableOrEmpty(houseToDistribute,
                                                                     distributionResult.resultingState) === false;
                } else {
                    mustDoOneMoreLap = false;
                }
            }
        }
        return {
            endsUpInStore: distributionResult.endsUpInStore,
            filledCoords,
            passedByStoreNTimes: distributionResult.passedByStoreNTimes,
            resultingState: distributionResult.resultingState,
            capturedSum: 0,
            captureMap: distributionResult.captureMap,
        };
    }

    public isHouseCapturableOrEmpty(coord: Coord, state: MancalaState): boolean {
        const houseContent: number = state.getPieceAt(coord);
        return houseContent === 1 || this.capturableValues.some((value: number) => value === houseContent);
    }

    /**
     * Should capture if there is context for it, and not capture otherwise
     * Should NOT increment the turn of the state
     */
    public abstract applyCapture(distributionResult: MancalaDistributionResult, config: MancalaConfig)
    : MancalaCaptureResult;

    public mustMonsoon(postCaptureState: MancalaState, config: MancalaConfig): Player[] {
        const postCaptureBoard: Table<number> = postCaptureState.getCopiedBoard();
        const opponent: Player = postCaptureState.getCurrentOpponent();
        const player: Player = postCaptureState.getCurrentPlayer();
        if (config.mustFeed) {
            if (MancalaRules.isStarving(player, postCaptureBoard) &&
                this.canDistribute(opponent, postCaptureState, config) === false)
            {
                // We are starving, and opponent can't feed us.
                // Opponent takes all their last piece for themselves
                return [opponent];
            }
        } else {
            if (MancalaRules.isStarving(opponent, postCaptureBoard)) {
                return [player];
            } else if (MancalaRules.isStarving(player, postCaptureBoard)) {
                return [opponent];
            }
        }
        return [];
    }

    public override getGameStatus(node: MancalaNode, config: MGPOptional<C>): GameStatus {
        const state: MancalaState = node.gameState;
        const width: number = node.gameState.getWidth();
        const seedsByHouse: number = config.get().seedsByHouse;
        const halfOfTotalSeeds: number = width * seedsByHouse;
        if (state.scores.get(Player.ZERO) > halfOfTotalSeeds) {
            return GameStatus.ZERO_WON;
        }
        if (state.scores.get(Player.ONE) > halfOfTotalSeeds) {
            return GameStatus.ONE_WON;
        }
        if (state.scores.get(Player.ZERO) === halfOfTotalSeeds &&
            state.scores.get(Player.ONE) === halfOfTotalSeeds)
        {
            return GameStatus.DRAW;
        }
        return GameStatus.ONGOING;
    }

    public override applyLegalMove(move: MancalaMove, state: MancalaState, config: MGPOptional<MancalaConfig>, _: void)
    : MancalaState
    {
        const distributionsResult: MancalaDistributionResult = this.distributeMove(move, state, config.get());
        const captureResult: MancalaCaptureResult = this.applyCapture(distributionsResult, config.get());
        let resultingState: MancalaState = captureResult.resultingState;
        const playerToMonsoon: Player[] = this.mustMonsoon(resultingState, config.get());
        if (playerToMonsoon.length === 1) {
            // if the player distributed their last seeds and the opponent could not give them seeds
            const monsoonResult: MancalaCaptureResult = this.monsoon(playerToMonsoon[0], captureResult);
            resultingState = monsoonResult.resultingState;
        } else if (playerToMonsoon.length === 2) {
            // if the player distributed their last seeds and the opponent could not give them seeds
            const monsoonResult: MancalaCaptureResult = this.sharedMonsoon(captureResult);
            resultingState = monsoonResult.resultingState;
        }
        return new MancalaState(resultingState.board,
                                resultingState.turn + 1,
                                resultingState.scores);
    }

    /**
     * Simply distribute the group of seeds in (x, y)
     * Does not make the capture nor verify the legality of the move
     * Returns the coords of the filled houses
     */
    public distributeHouse(x: number, y: number, previousLapResult: MancalaDistributionResult, config: MancalaConfig)
    : MancalaDistributionResult
    {
        let coord: Coord = new Coord(x, y);
        const initial: Coord = new Coord(x, y);
        let seedsInHand: number = previousLapResult.resultingState.getPieceAt(initial);
        let resultingState: MancalaState = previousLapResult.resultingState.setPieceAt(initial, 0);
        const player: Player = resultingState.getCurrentPlayer();
        // to remember in order not to sow in the starting space if we make a full turn
        const filledCoords: Coord[] = [];
        let passedByStoreNTimes: number = 0;
        let previousDropWasStore: boolean = false;
        let endsUpInStore: boolean = false;
        let capturedSum: number = 0;
        while (seedsInHand > 0) {
            previousDropWasStore = endsUpInStore;
            endsUpInStore = false;
            const nextCoord: MGPOptional<Coord> =
                this.getNextCoord(coord, previousDropWasStore, previousLapResult.resultingState, config);
            endsUpInStore = nextCoord.isAbsent();

            if (endsUpInStore) {
                passedByStoreNTimes++;
                resultingState = resultingState.feedStore(player);
                seedsInHand--;
                filledCoords.push(MancalaRules.FAKE_STORE_COORD.get(player).get());
            } else {
                coord = nextCoord.get();
                if (initial.equals(coord) === false || config.feedOriginalHouse) {
                    // not to distribute on our starting space
                    const dropResult: MancalaDropResult = this.getDropResult(seedsInHand, resultingState, coord);
                    resultingState = dropResult.resultingState;
                    previousLapResult.captureMap = TableUtils.add(previousLapResult.captureMap, dropResult.captureMap);
                    capturedSum += dropResult.capturedSum;
                    filledCoords.push(coord);
                    seedsInHand--; // drop in this space a piece we have in hand
                }
            }
        }
        return {
            filledCoords,
            passedByStoreNTimes,
            endsUpInStore,
            resultingState,
            capturedSum,
            captureMap: previousLapResult.captureMap,
        };
    }

    /**
     * @param config the config of the game
     * @param _seedsInHand the number of seed in hand at the drop moment
     * @param state the board on which a seed is going to be dropped
     * @param coord the coord to feed
     * @returns the result of the drop (updated)
     */
    public getDropResult(_seedsInHand: number, state: MancalaState, coord: Coord)
    : MancalaDropResult
    {
        return {
            capturedSum: 0,
            captureMap: TableUtils.create(state.getWidth(), 2, 0),
            resultingState: state.feed(coord),
        };
    }

    public getNextCoord(coord: Coord,
                        previousDropWasStore: boolean,
                        state: MancalaState,
                        config: MancalaConfig)
    : MGPOptional<Coord>
    {
        const player: Player = state.getCurrentPlayer();
        if (coord.y === 0) {
            if (coord.x === (state.getWidth() - 1)) {
                if (config.passByPlayerStore && player === Player.ONE && previousDropWasStore === false) {
                    return MGPOptional.empty(); // This seed is dropped in the store
                } else {
                    return MGPOptional.of(new Coord(coord.x, 1)); // go from the bottom row to the top row
                }
            } else {
                return MGPOptional.of(new Coord(coord.x + 1, 0)); // clockwise order on the top = left to right
            }
        } else {
            if (coord.x === 0) {
                if (config.passByPlayerStore && player === Player.ZERO && previousDropWasStore === false) {
                    return MGPOptional.empty(); // This seed is dropped in the store
                } else {
                    return MGPOptional.of(new Coord(0, 0)); // go from the bottom row to the top
                }
            } else {
                return MGPOptional.of(new Coord(coord.x - 1, 1)); // clockwise order on the bottom = right to left
            }
        }
    }

    public doesDistribute(x: number, y: number, state: MancalaState, config: MancalaConfig): boolean {
        const board: Table<number> = state.board;
        let pieceNeededToFeedStore: number;
        if (y === 0) {
            pieceNeededToFeedStore = state.getWidth() - x;
        } else {
            pieceNeededToFeedStore = x + 1;
        }
        const storeOffset: number = config.passByPlayerStore ? 1 : 0;
        const pieceNeededToFeedOpponent: number = pieceNeededToFeedStore + storeOffset;
        return pieceNeededToFeedOpponent <= board[y][x]; // distribution from right to left
    }

    public canDistribute(player: Player, state: MancalaState, config: MancalaConfig): boolean {
        for (let x: number = 0; x < state.getWidth(); x++) {
            if (this.doesDistribute(x, player.getOpponent().getValue(), state, config)) {
                return true;
            }
        }
        return false;
    }

    /**
      * Captures all the seeds of the monsooning player.
      * Returns the sum of all captured seeds.
      * Is called when a game is over because of starvation
      * Or for Ba-awa/Adi: when we drop below 9 pieces
      */
    public monsoon(monsooningPlayer: Player, postCaptureResult: MancalaCaptureResult): MancalaCaptureResult {
        const state: MancalaState = postCaptureResult.resultingState;
        const resultingBoard: number[][] = TableUtils.create(state.getWidth(), 2, 0);
        const captured: PlayerNumberMap = state.getScoresCopy();
        const capturedSum: number = state.getTotalRemainingSeeds();
        const captureMap: number[][] = TableUtils.add(postCaptureResult.captureMap, state.board);
        captured.add(monsooningPlayer, capturedSum);
        return {
            capturedSum,
            captureMap,
            resultingState: new MancalaState(resultingBoard, state.turn, captured),
        };
    }

    public sharedMonsoon(postCaptureResult: MancalaCaptureResult): MancalaCaptureResult {
        const state: MancalaState = postCaptureResult.resultingState;
        const resultingBoard: number[][] = TableUtils.create(state.getWidth(), 2, 0);
        const captured: PlayerNumberMap = state.getScoresCopy();
        const capturedSum: number = state.getTotalRemainingSeeds();
        const captureMap: number[][] = TableUtils.add(postCaptureResult.captureMap, state.board);
        captured.add(Player.ZERO, Math.floor(capturedSum / 2));
        captured.add(Player.ONE, Math.floor(capturedSum / 2));
        return {
            capturedSum,
            captureMap,
            resultingState: new MancalaState(resultingBoard, state.turn, captured),
        };
    }

}
