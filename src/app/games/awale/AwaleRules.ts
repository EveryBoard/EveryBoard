import { GameStatus, Rules } from '../../jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { AwaleState } from './AwaleState';
import { AwaleMove } from './AwaleMove';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { display, Utils } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Coord } from 'src/app/jscaip/Coord';
import { AwaleFailure } from './AwaleFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export type AwaleLegalityInformation = {
    captured: ReadonlyArray<number>,
    resultingBoard: Table<number>,
}

export class AwaleNode extends MGPNode<AwaleRules, AwaleMove, AwaleState, AwaleLegalityInformation> {}

export class AwaleRules extends Rules<AwaleMove, AwaleState, AwaleLegalityInformation> {

    public static VERBOSE: boolean = false;

    public applyLegalMove(move: AwaleMove, state: AwaleState, infos: AwaleLegalityInformation): AwaleState {
        display(AwaleRules.VERBOSE, { called: 'AwaleRules.applyLegalMove', move, state, status });
        const turn: number = state.turn;

        const captured: readonly [number, number] = [
            state.captured[0] + infos.captured[0],
            state.captured[1] + infos.captured[1],
        ];

        return new AwaleState(ArrayUtils.copyBiArray(infos.resultingBoard), turn + 1, captured);
    }
    /**
     * Captures all the seeds of the mansooning player.
     * Returns the sum of all captured seeds.
     * Is called when a game is over because of starvation
     */
    public static mansoon(mansooningPlayer: number, board: number[][]): number {
        let sum: number = 0;
        let x: number = 0;
        do {
            sum += board[mansooningPlayer][x];
            board[mansooningPlayer][x] = 0;
            x++;
        } while (x < 6);
        return sum;
    }
    /**
     * Modifies the move to addPart the capture.
     * Modifies the board to get the after-move result.
     * Returns -1 if it is not legal, if so, the board should not be affected
     * Returns the number captured otherwise
     */
    public static isLegal(move: AwaleMove, state: AwaleState): MGPFallible<AwaleLegalityInformation> {
        const turn: number = state.turn;
        let resultingBoard: number[][] = state.getCopiedBoard();

        let captured: [number, number] = [0, 0];

        const player: number = turn % 2;
        const opponent: number = (turn + 1) % 2;

        const x: number = move.x;
        if (resultingBoard[player][x] === 0) {
            return MGPFallible.failure(AwaleFailure.MUST_CHOOSE_NONEMPTY_HOUSE());
        }

        if (!AwaleRules.doesDistribute(x, player, resultingBoard) && AwaleRules.isStarving(opponent, resultingBoard) ) {
            return MGPFallible.failure(AwaleFailure.SHOULD_DISTRIBUTE());
        }
        // arrived here you can distribute this house but we'll have to check if you can capture
        const lastSpace: Coord = AwaleRules.distribute(x, player, resultingBoard);
        // do the distribution and retrieve the landing part of the last stone
        const landingCamp: number = lastSpace.y;
        if (landingCamp === player) {
            // we finish sowing on our own side, nothing else to check
            return MGPFallible.success({ captured: [0, 0], resultingBoard });
        }
        // we finish sowing on the opponent's side, we therefore check the captures
        const boardBeforeCapture: number[][] = ArrayUtils.copyBiArray(resultingBoard);
        captured[player] = AwaleRules.capture(lastSpace.x, opponent, player, resultingBoard);
        if (AwaleRules.isStarving(opponent, resultingBoard)) {
            if (captured[player] > 0) {
                /**
                 * if the distribution would capture all seeds
                 * the move is legal but the capture is forbidden and cancelled
                 */
                resultingBoard = boardBeforeCapture; // undo the capturing
                captured = [0, 0];
            }
        }
        if (AwaleRules.isStarving(player, resultingBoard) && !AwaleRules.canDistribute(opponent, resultingBoard)) {
            // if the player distributed his last seeds and the opponent could not give him seeds
            captured[opponent] += AwaleRules.mansoon(opponent, resultingBoard);
        }
        return MGPFallible.success({ captured, resultingBoard });
    }
    public isLegal(move: AwaleMove, state: AwaleState): MGPFallible<AwaleLegalityInformation> {
        return AwaleRules.isLegal(move, state);
    }
    public static doesDistribute(x: number, y: number, board: number[][]): boolean {
        if (y === 0) { // distribution from left to right
            return board[y][x] > (5 - x);
        }
        return board[y][x] > x; // distribution from right to left
    }
    public static canDistribute(player: number, board: number[][]): boolean {
        let x: number = 0;
        do {
            if (AwaleRules.doesDistribute(x++, player, board)) {
                return true;
            }
        } while (x < 6);
        return false;
    }
    public static isStarving(player: number, board: number[][]): boolean {
        let i: number = 0;
        do {
            if (board[player][i++] > 0) {
                return false; // found some food there, so not starving
            }
        } while (i < 6);
        return true;
    }
    /**
     * Simply applies the move on the board (the distribution part).
     * Does not make the capture nor verify the legality of the move
     * Returns the coord of the last space the move got down
     */
    public static distribute(x: number, y: number, board: number[][]): Coord {
        // iy and ix are the initial spaces
        const ix: number = x;
        const iy: number = y;
        // to remember in order not to sow in the starting space if we make a full turn
        let inHand: number = board[y][x];
        board[y][x] = 0;
        while (inHand > 0) {
            // get next space
            if (y === 0) {
                if (x === 5) {
                    y = 1; // go from the bottom row to the top row
                } else {
                    x++; // clockwise order on the top = left to right
                }
            } else {
                if (x === 0) {
                    y = 0; // go from the bottom row to the top
                } else {
                    x--; // clockwise order on the bottom = right to left
                }
            }
            if ((x !== ix) || (y !== iy)) {
                // not to distribute on our starting space
                board[y][x] += 1;
                inHand--; // drop in this space a piece we have in hand
            }
        }

        return new Coord(x, y);
    }
    /**
     * Only called if y and player are not equal.
     * If the condition to make an capture into the opponent's side are met
     * Captures and return the number of captured
     * Captures even if this could mean doing an illegal starvation
     */
    public static capture(x: number, y: number, player: number, board: number[][]): number {
        let target: number = board[y][x];
        if ((target < 2) || (target > 3)) {
            return 0; // first space not capturable
        }

        let captured: number = 0;
        let direction: number = -1; // by defaut, capture from right to left
        let limite: number = -1;
        if (player === 0) {
            /**
             * if turn == 0 capture is on the bottom line
             * means capture goes from left to right ( + 1)
             * so one ending condition of the loop is reaching index 6
             */
            direction = +1;
            limite = 6;
        }

        do {
            captured += target; // we addPart to the player score the captured seeds
            board[y][x] = 0; // since now they're capture, we get them off the board
            x += direction;
        } while ((x !== limite) && (((target = board[y][x]) === 2) || (target === 3)));
        return captured;
    }
    public static getGameStatus(node: AwaleNode): GameStatus {
        const state: AwaleState = node.gameState;
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
    public getGameStatus(node: AwaleNode): GameStatus {
        return AwaleRules.getGameStatus(node);
    }
}
