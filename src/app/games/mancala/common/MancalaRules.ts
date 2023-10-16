import { Coord } from 'src/app/jscaip/Coord';
import { MancalaConfig } from './MancalaConfig';
import { MancalaState } from './MancalaState';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { Move } from 'src/app/jscaip/Move';
import { Rules } from 'src/app/jscaip/Rules';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ReversibleMap } from 'src/app/utils/MGPMap';
import { GameNode } from 'src/app/jscaip/GameNode';

export interface MancalaCaptureResult {

    captureMap: Table<number>;

    capturedSum: number;

    resultingState: MancalaState;
}

export type MancalaDistributionResult = {

    filledCoords: Coord[];

    passedByStoreNTimes: number;

    resultingState: MancalaState;

    endsUpInStore: boolean;
}

export abstract class MancalaRules<M extends Move> extends Rules<M, MancalaState, MancalaConfig> {

    // These are the coordinates of the store. These are fake coordinates since the stores are not on the board
    public static FAKE_STORE_COORD: ReversibleMap<Player, Coord> = new ReversibleMap([
        { key: Player.ZERO, value: new Coord(-1, -1) },
        { key: Player.ONE, value: new Coord(+2, +2) },
    ]);

    public static isStarving(player: Player, board: Table<number>): boolean {
        let i: number = 0;
        const playerY: number = player.getOpponent().value; // For player 0 has row 1
        while (i < board[0].length) {
            if (board[playerY][i++] > 0) {
                return false; // found some food there, so not starving
            }
        }
        return true;
    }

    protected constructor(config: MancalaConfig) {
        super(MancalaState, config);
    }

    public abstract override isLegal(move: M, state: MancalaState): MGPFallible<void>;

    /**
     * Apply the distribution part of the move M
     * Apply the capture that happend due to distribution (by example the passage in the store)
     * Should NOT increment the turn of the state
     */
    public abstract distributeMove(move: M, state: MancalaState): MancalaDistributionResult;

    /**
     * Should capture if there is context for it, and not capture otherwise
     * Should NOT increment the turn of the state
     */
    public abstract applyCapture(distributionResult: MancalaDistributionResult): MancalaCaptureResult;

    public mustMansoon(postCaptureState: MancalaState): PlayerOrNone {
        const postCaptureBoard: Table<number> = postCaptureState.getCopiedBoard();
        const opponent: Player = postCaptureState.getCurrentOpponent();
        const player: Player = postCaptureState.getCurrentPlayer();
        if (postCaptureState.config.mustFeed) {
            if (MancalaRules.isStarving(player, postCaptureBoard) &&
                this.canDistribute(opponent, postCaptureBoard) === false)
            {
                // Opponent takes all their last piece for themselves
                return opponent;
            }
        } else {
            if (MancalaRules.isStarving(opponent, postCaptureBoard)) {
                return player;
            } else if (MancalaRules.isStarving(player, postCaptureBoard)) {
                return opponent;
            }
        }
        return PlayerOrNone.NONE;
    }

    public getGameStatus(node: GameNode<M, MancalaState>): GameStatus {
        const state: MancalaState = node.gameState;
        const width: number = node.gameState.getWidth();
        const seedsByHouse: number = node.gameState.config.seedsByHouse;
        const halfOfTotalSeeds: number = width * seedsByHouse;
        if (state.scores[0] > halfOfTotalSeeds) {
            return GameStatus.ZERO_WON;
        }
        if (state.scores[1] > halfOfTotalSeeds) {
            return GameStatus.ONE_WON;
        }
        if (state.scores[0] === halfOfTotalSeeds && state.scores[1] === halfOfTotalSeeds) {
            return GameStatus.DRAW;
        }
        return GameStatus.ONGOING;
    }

    public applyLegalMove(move: M, state: MancalaState, _: void): MancalaState {
        const distributionsResult: MancalaDistributionResult = this.distributeMove(move, state);
        const captureResult: MancalaCaptureResult = this.applyCapture(distributionsResult);
        let resultingState: MancalaState = captureResult.resultingState;
        const playerToMansoon: PlayerOrNone = this.mustMansoon(resultingState);
        if (playerToMansoon !== PlayerOrNone.NONE) {
            // if the player distributed their last seeds and the opponent could not give them seeds
            const mansoonResult: MancalaCaptureResult = this.monsoon(playerToMansoon as Player, captureResult);
            resultingState = mansoonResult.resultingState;
        }
        return new MancalaState(resultingState.board,
                                resultingState.turn + 1,
                                resultingState.scores,
                                resultingState.config);
    }

    /**
     * Simply distribute then group of stone in (x, y)
     * Does not make the capture nor verify the legality of the move
     * Returns the coords of the filled houses
     */
    public distributeHouse(x: number, y: number, state: MancalaState): MancalaDistributionResult {
        let coord: Coord = new Coord(x, y);
        const resultingBoard: number[][] = state.getCopiedBoard();
        const player: Player = state.getCurrentPlayer();
        const initial: Coord = new Coord(x, y);
        // to remember in order not to sow in the starting space if we make a full turn
        let seedsInHand: number = resultingBoard[y][x];
        const filledCoords: Coord[] = [];
        resultingBoard[y][x] = 0;
        let passedByStoreNTimes: number = 0;
        let previousDropWasStore: boolean = false;
        let endsUpInStore: boolean = false;
        while (seedsInHand > 0) {
            previousDropWasStore = endsUpInStore;
            endsUpInStore = false;
            // get next space
            const nextCoord: MGPOptional<Coord> = this.getNextCoord(coord, player, previousDropWasStore, state);
            endsUpInStore = nextCoord.isAbsent();

            if (endsUpInStore) {
                passedByStoreNTimes++;
                seedsInHand--;
                filledCoords.push(MancalaRules.FAKE_STORE_COORD.get(player).get());
            } else {
                coord = nextCoord.get();
                if (initial.equals(coord) === false || state.config.feedOriginalHouse) {
                    // not to distribute on our starting space
                    resultingBoard[coord.y][coord.x] += 1;
                    filledCoords.push(coord);
                    seedsInHand--; // drop in this space a piece we have in hand
                }
            }
        }
        const score: [number, number] = state.getScoresCopy();
        score[player.value] += passedByStoreNTimes;
        return {
            filledCoords: filledCoords,
            passedByStoreNTimes,
            endsUpInStore,
            resultingState: new MancalaState(resultingBoard, state.turn, score, state.config),
        };
    }

    public getNextCoord(coord: Coord, player: Player, previousDropWasStore: boolean, state: MancalaState)
    : MGPOptional<Coord>
    {
        if (coord.y === 0) {
            if (coord.x === (state.board[0].length - 1)) {
                if (state.config.passByPlayerStore && player === Player.ONE && previousDropWasStore === false) {
                    return MGPOptional.empty(); // This seed is dropped in the store
                } else {
                    return MGPOptional.of(new Coord(coord.x, 1)); // go from the bottom row to the top row
                }
            } else {
                return MGPOptional.of(new Coord(coord.x + 1, 0)); // clockwise order on the top = left to right
            }
        } else {
            if (coord.x === 0) {
                if (state.config.passByPlayerStore && player === Player.ZERO && previousDropWasStore === false) {
                    return MGPOptional.empty(); // This seed is dropped in the store
                } else {
                    return MGPOptional.of(new Coord(0, 0)); // go from the bottom row to the top
                }
            } else {
                return MGPOptional.of(new Coord(coord.x - 1, 1)); // clockwise order on the bottom = right to left
            }
        }
    }

    public doesDistribute(x: number, y: number, board: Table<number>): boolean {
        if (y === 0) { // distribution from left to right
            return board[y][x] > ((board[0].length - 1) - x);
        }
        return board[y][x] > x; // distribution from right to left
    }

    public canDistribute(player: Player, board: Table<number>): boolean {
        for (let x: number = 0; x < board[0].length; x++) {
            if (this.doesDistribute(x, player.getOpponent().value, board)) {
                return true;
            }
        }
        return false;
    }

    /**
      * Captures all the seeds of the mansooning player.
      * Returns the sum of all captured seeds.
      * Is called when a game is over because of starvation
      */
    public monsoon(mansooningPlayer: Player, postCaptureResult: MancalaCaptureResult): MancalaCaptureResult {
        const state: MancalaState = postCaptureResult.resultingState;
        const resultingBoard: number[][] = state.getCopiedBoard();
        const captured: [number, number] = state.getScoresCopy();
        let capturedSum: number = 0;
        const captureMap: number[][] = ArrayUtils.copyBiArray(postCaptureResult.captureMap);
        let x: number = 0;
        const mansoonedY: number = mansooningPlayer.getOpponent().value;
        while (x < state.board[0].length) {
            capturedSum += resultingBoard[mansoonedY][x];
            captureMap[mansoonedY][x] += resultingBoard[mansoonedY][x];
            resultingBoard[mansoonedY][x] = 0;
            x++;
        }
        captured[mansooningPlayer.value] += capturedSum;
        return {
            capturedSum,
            captureMap,
            resultingState: new MancalaState(resultingBoard, state.turn, captured, state.config),
        };
    }

}
