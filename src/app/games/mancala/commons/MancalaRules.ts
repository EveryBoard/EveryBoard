import { Coord } from 'src/app/jscaip/Coord';
import { MancalaConfig } from './MancalaConfig';
import { MancalaState } from './MancalaState';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { Move } from 'src/app/jscaip/Move';
import { Rules } from 'src/app/jscaip/Rules';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ReversibleMap } from 'src/app/utils/MGPMap';

export interface MancalaCaptureResult {

    captureMap: Table<number>;

    capturedSum: number;

    resultingState: MancalaState;
}

export type MancalaDistributionResult = {

    filledCoords: Coord[];

    passedByKalahNTimes: number;

    resultingState: MancalaState;

    endUpInKalah: boolean;
}

export abstract class MancalaRules<M extends Move> extends Rules<M, MancalaState> {

    public static FAKE_KALAH_COORD: ReversibleMap<Player, Coord> = new ReversibleMap([
        { key: Player.ZERO, value: new Coord(-1, -1) },
        { key: Player.ONE, value: new Coord(+2, +2) },
    ]);
    public static isStarving(player: Player, board: Table<number>): boolean {
        let i: number = 0;
        const playerY: number = player.getOpponent().value; // For player 0 has row 1
        do {
            if (board[playerY][i++] > 0) {
                return false; // found some food there, so not starving
            }
        } while (i < 6);
        return true;
    }
    protected constructor(public readonly config: MancalaConfig) {
        super(MancalaState);
    }
    public abstract override isLegal(move: M, state: MancalaState): MGPFallible<void>;

    /**
     * Should NOT increment the turn of the state
     * Apply the distribution part of the move M
     * Apply the capture that happend due to distribution (by example the passage in the Kalah)
     */
    public abstract distributeMove(move: M, state: MancalaState): MancalaDistributionResult;

    /**
     * Should NOT increment the turn of the state
     * Should verify that it's legal, and just skip if it is not
     */
    public abstract applyCapture(distributionResult: MancalaDistributionResult): MancalaCaptureResult;

    public mustMansoon(postCaptureState: MancalaState): PlayerOrNone {
        const postCaptureBoard: Table<number> = postCaptureState.getCopiedBoard();
        const opponent: Player = postCaptureState.getCurrentOpponent();
        const player: Player = postCaptureState.getCurrentPlayer();
        if (this.config.mustFeed) {
            if (MancalaRules.isStarving(player, postCaptureBoard) &&
                this.canDistribute(opponent, postCaptureBoard) === false)
            {
                return opponent;
                // Opponent takes all his last piece for himself
            }
        } else if (MancalaRules.isStarving(opponent, postCaptureBoard)) {
            return player;
        }
        return PlayerOrNone.NONE;
    }
    public getGameStatus(node: MGPNode<MancalaRules<Move>, Move, MancalaState>): GameStatus {
        const state: MancalaState = node.gameState;
        if (state.captured[0] > 24) {
            return GameStatus.ZERO_WON;
        }
        if (state.captured[1] > 24) {
            return GameStatus.ONE_WON;
        }
        if (state.captured[0] === 24 && state.captured[1] === 24) {
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
            // if the player distributed his last seeds and the opponent could not give him seeds
            const mansoonResult: MancalaCaptureResult = this.mansoon(playerToMansoon as Player, captureResult);
            resultingState = mansoonResult.resultingState;
        }
        return new MancalaState(resultingState.board,
                                resultingState.turn + 1,
                                resultingState.captured);
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
        // iy and ix are the initial spaces
        const i: Coord = new Coord(x, y);
        // to remember in order not to sow in the starting space if we make a full turn
        let inHand: number = resultingBoard[y][x];
        const filledCoords: Coord[] = [];
        resultingBoard[y][x] = 0;
        let passedByKalahNTimes: number = 0;
        let previousDropWasKalah: boolean = false;
        let endUpInKalah: boolean = false;
        while (inHand > 0) {
            previousDropWasKalah = endUpInKalah;
            endUpInKalah = false;
            // get next space
            const nextCoord: MGPOptional<Coord> = this.getNextCoord(coord, player, previousDropWasKalah);
            endUpInKalah = nextCoord.isAbsent();

            if (endUpInKalah) {
                passedByKalahNTimes++;
                inHand--;
                filledCoords.push(MancalaRules.FAKE_KALAH_COORD.get(player).get());
            } else {
                coord = nextCoord.get();
                if (i.equals(coord) === false || this.config.feedOriginalHouse) {
                    // not to distribute on our starting space
                    resultingBoard[coord.y][coord.x] += 1;
                    filledCoords.push(coord);
                    inHand--; // drop in this space a piece we have in hand
                }
            }
        }
        return {
            filledCoords: filledCoords,
            passedByKalahNTimes,
            endUpInKalah,
            resultingState: new MancalaState(resultingBoard, state.turn, state.getCapturedCopy()),
        };
    }
    public getNextCoord(coord: Coord, player: Player, previousDropWasKalah: boolean): MGPOptional<Coord> {
        if (coord.y === 0) {
            if (coord.x === 5) {
                if (this.config.passByPlayerKalah && player === Player.ONE && previousDropWasKalah === false) {
                    return MGPOptional.empty(); // This seed is dropped in the Kalah
                } else {
                    return MGPOptional.of(new Coord(coord.x, 1)); // go from the bottom row to the top row
                }
            } else {
                return MGPOptional.of(new Coord(coord.x + 1, coord.y)); // clockwise order on the top = left to right
            }
        } else {
            if (coord.x === 0) {
                if (this.config.passByPlayerKalah && player === Player.ZERO && previousDropWasKalah === false) {
                    return MGPOptional.empty(); // This seed is dropped in the Kalah
                } else {
                    return MGPOptional.of(new Coord(coord.x, 0)); // go from the bottom row to the top
                }
            } else {
                return MGPOptional.of(new Coord(coord.x - 1, coord.y)); // clockwise order on the bottom = right to left
            }
        }
    }
    public doesDistribute(x: number, y: number, board: Table<number>): boolean {
        if (y === 0) { // distribution from left to right
            return board[y][x] > (5 - x);
        }
        return board[y][x] > x; // distribution from right to left
    }
    public canDistribute(player: Player, board: Table<number>): boolean {
        for (let x: number = 0; x < 6; x++) {
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
    public mansoon(mansooningPlayer: Player, postCaptureResult: MancalaCaptureResult): MancalaCaptureResult {
        const state: MancalaState = postCaptureResult.resultingState;
        const resultingBoard: number[][] = state.getCopiedBoard();
        const captured: [number, number] = state.getCapturedCopy();
        let capturedSum: number = 0;
        const captureMap: number[][] = ArrayUtils.copyBiArray(postCaptureResult.captureMap);
        let x: number = 0;
        const mansoonedY: number = mansooningPlayer.getOpponent().value;
        do {
            capturedSum += resultingBoard[mansoonedY][x];
            captureMap[mansoonedY][x] += resultingBoard[mansoonedY][x];
            resultingBoard[mansoonedY][x] = 0;
            x++;
        } while (x < 6);
        captured[mansooningPlayer.value] += capturedSum;
        return {
            capturedSum,
            captureMap,
            resultingState: new MancalaState(resultingBoard, state.turn, captured),
        };
    }
}
