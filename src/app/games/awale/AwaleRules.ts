import { Rules } from '../../jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { AwaleState } from './AwaleState';
import { AwaleMove } from './AwaleMove';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { display } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { Coord } from 'src/app/jscaip/Coord';
import { AwaleFailure } from './AwaleFailure';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/GameStatus';

export class AwaleNode extends MGPNode<AwaleRules, AwaleMove, AwaleState> {}

export interface CaptureResult {

    captureMap: Table<number>;

    capturedSum: number;

    resultingBoard: Table<number>;
}

export class AwaleRules extends Rules<AwaleMove, AwaleState> {

    public static VERBOSE: boolean = false;

    public applyLegalMove(move: AwaleMove, state: AwaleState, _info: void): AwaleState {
        display(AwaleRules.VERBOSE, { called: 'AwaleRules.applyLegalMove', move, state });
        const x: number = move.x;
        const player: Player = state.getCurrentPlayer();
        const opponent: Player = state.getCurrentOpponent();
        const playerY: number = opponent.value; // So that Player ZERO plays on the row 1
        const resultingBoard: number[][] = state.getCopiedBoard();

        // distribute and retrieve the landing coord of the last stone
        const filledCoords: Coord[] = AwaleRules.distribute(x, playerY, resultingBoard);
        const lastSpace: Coord = filledCoords[filledCoords.length - 1];
        const landingCamp: number = lastSpace.y;
        if (landingCamp === playerY) {
            // we finish sowing on our own side, nothing else to do
            return new AwaleState(resultingBoard, state.turn + 1, state.captured);
        } else {
            // we finish sowing on the opponent's side, we therefore check the captures
            return this.applyPotentialCapture(player, lastSpace, resultingBoard, state);
        }
    }
    private applyPotentialCapture(player: Player,
                                  lastSpace: Coord,
                                  resultingBoard: number[][],
                                  state: AwaleState)
    : AwaleState
    {
        const opponent: Player = state.getCurrentOpponent();
        const captured: [number, number] = [state.captured[0], state.captured[1]];
        const captureResult: CaptureResult =
            AwaleRules.captureIfLegal(lastSpace.x, lastSpace.y, player, resultingBoard);
        captured[player.value] += captureResult.capturedSum;
        const postCaptureBoard: Table<number> = captureResult.resultingBoard;
        if (AwaleRules.mustMansoon(player, postCaptureBoard)) {
            // if the player distributed his last seeds and the opponent could not give him seeds
            const mansoonResult: CaptureResult = AwaleRules.mansoon(opponent, postCaptureBoard);
            captured[opponent.value] += mansoonResult.capturedSum;
            return new AwaleState(mansoonResult.resultingBoard, state.turn + 1, captured);
        } else {
            return new AwaleState(postCaptureBoard, state.turn + 1, captured);
        }
    }
    public static mustMansoon(player: Player, postCaptureBoard: Table<number>): boolean {
        return AwaleRules.isStarving(player, postCaptureBoard) &&
               AwaleRules.canDistribute(player.getOpponent(), postCaptureBoard) === false;
    }

    /**
     * Captures all the seeds of the mansooning player.
     * Returns the sum of all captured seeds.
     * Is called when a game is over because of starvation
     */
    public static mansoon(mansooningPlayer: Player, board: Table<number>): CaptureResult {
        const resultingBoard: number[][] = ArrayUtils.copyBiArray(board);
        let capturedSum: number = 0;
        const captureMap: number[][] = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        let x: number = 0;
        const mansoonedY: number = mansooningPlayer.getOpponent().value;
        do {
            capturedSum += resultingBoard[mansoonedY][x];
            captureMap[mansoonedY][x] = resultingBoard[mansoonedY][x];
            resultingBoard[mansoonedY][x] = 0;
            x++;
        } while (x < 6);
        return { capturedSum, captureMap, resultingBoard };
    }
    /**
     * Modifies the move to addPart the capture.
     * Modifies the board to get the after-move result.
     * Returns -1 if it is not legal, if so, the board should not be affected
     * Returns the number captured otherwise
     */
    public static isLegal(move: AwaleMove, state: AwaleState): MGPValidation {
        const opponent: Player = state.getCurrentOpponent();
        const playerY: number = opponent.value; // So player 0 is in row 1

        const x: number = move.x;
        if (state.getPieceAtXY(x, playerY) === 0) {
            return MGPValidation.failure(AwaleFailure.MUST_CHOOSE_NON_EMPTY_HOUSE());
        }
        const opponentIsStarving: boolean = AwaleRules.isStarving(opponent, state.board);
        const playerDoesNotDistribute: boolean = AwaleRules.doesDistribute(x, playerY, state.board) === false;
        if (opponentIsStarving && playerDoesNotDistribute) {
            return MGPValidation.failure(AwaleFailure.SHOULD_DISTRIBUTE());
        }
        return MGPValidation.SUCCESS;
    }
    public isLegal(move: AwaleMove, state: AwaleState): MGPValidation {
        return AwaleRules.isLegal(move, state);
    }
    public static doesDistribute(x: number, y: number, board: Table<number>): boolean {
        if (y === 0) { // distribution from left to right
            return board[y][x] > (5 - x);
        }
        return board[y][x] > x; // distribution from right to left
    }
    public static canDistribute(player: Player, board: Table<number>): boolean {
        for (let x: number = 0; x < 6; x++) {
            if (AwaleRules.doesDistribute(x, player.getOpponent().value, board)) {
                return true;
            }
        }
        return false;
    }
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
    /**
     * Simply applies the move on the board (the distribution part).
     * Does not make the capture nor verify the legality of the move
     * Returns the coord of the last landing space of the move
     */
    public static distribute(x: number, y: number, board: number[][]): Coord[] {
        // iy and ix are the initial spaces
        const ix: number = x;
        const iy: number = y;
        // to remember in order not to sow in the starting space if we make a full turn
        let inHand: number = board[y][x];
        const filled: Coord[] = [];
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
                filled.push(new Coord(x, y));
                inHand--; // drop in this space a piece we have in hand
            }
        }
        return filled;
    }
    /**
     * Only called if y and player are not equal.
     * If the condition to make a capture into the opponent's side are met
     * Captures and return the number of captured
     * Captures even if this could mean doing an illegal starvation
     */
    private static capture(x: number, y: number, player: Player, board: Table<number>): CaptureResult {
        const resultingBoard: number[][] = ArrayUtils.copyBiArray(board);
        const playerY: number = player.getOpponent().value;
        assert(y !== playerY, 'AwaleRules.capture cannot capture the players house');
        let target: number = resultingBoard[y][x];
        let capturedSum: number = 0;
        const captureMap: number[][] = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        if ((target < 2) || (target > 3)) {
            // first space not capturable
            return { capturedSum: 0, captureMap, resultingBoard };
        }

        let direction: number = -1; // by defaut, capture from right to left
        let limit: number = -1;
        if (player === Player.ONE) {
            /** if Player.ONE capture, it is on the bottom line
              * means capture goes from left to right ( + 1)
              * so one ending condition of the loop is reaching index 6
             */
            direction = +1;
            limit = 6;
        }

        do {
            captureMap[y][x] = target; // we addPart to the player score the captured seeds
            capturedSum += target;
            resultingBoard[y][x] = 0; // since now they're capture, we get them off the board
            x += direction;
            target = resultingBoard[y][x];
        } while ((x !== limit) && ((target === 2) || (target === 3)));
        return { capturedSum, captureMap, resultingBoard };
    }
    public static captureIfLegal(x: number, y: number, player: Player, board: number[][]): CaptureResult {
        const boardBeforeCapture: number[][] = ArrayUtils.copyBiArray(board);
        const captureResult: CaptureResult = AwaleRules.capture(x, y, player, board);
        const isStarving: boolean = AwaleRules.isStarving(player.getOpponent(), captureResult.resultingBoard);
        if (captureResult.capturedSum > 0 && isStarving) {
            /* if the distribution would capture all seeds
             * the capture is forbidden and cancelled
             */
            return {
                capturedSum: 0,
                resultingBoard: boardBeforeCapture, // undo the capturing
                captureMap: [
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                ],
            };
        } else {
            return captureResult;
        }
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
