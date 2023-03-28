import { Coord } from '../../jscaip/Coord';
import { GameStatus, Rules } from '../../jscaip/Rules';
import { SCORE } from '../../jscaip/SCORE';
import { MGPNode } from '../../jscaip/MGPNode';
import { P4State } from './P4State';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { display } from 'src/app/utils/utils';
import { P4Move } from './P4Move';
import { Table } from 'src/app/utils/ArrayUtils';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { P4Failure } from './P4Failure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';

export class P4Node extends MGPNode<P4Rules, P4Move, P4State> {}

export class P4Rules extends Rules<P4Move, P4State> {

    public static VERBOSE: boolean = false;

    public static getOwner(piece: PlayerOrNone): PlayerOrNone {
        return piece;
    }
    public static isInRange(coord: Coord): boolean {
        return coord.isInRange(7, 6);
    }
    public static P4_HELPER: NInARowHelper<PlayerOrNone> =
        new NInARowHelper(P4Rules.isInRange, P4Rules.getOwner, 4);

    public static getVictoriousCoords(state: P4State): Coord[] {
        const coords: Coord[] = [];
        for (let x: number = 0; x < 7; x++) {
            for (let y: number = 5; y !== -1 && state.board[y][x].isPlayer(); y--) {
                const spaceScore: number = P4Rules.getSquareScore(state, new Coord(x, y));
                if (spaceScore === Player.ZERO.getVictoryValue() ||
                    spaceScore === Player.ONE.getVictoryValue())
                {
                    coords.push(new Coord(x, y));
                }
            }
        }
        return coords;
    }
    private static getBoardValueFromScratch(state: P4State): BoardValue {
        display(P4Rules.VERBOSE, { P4Rules_getBoardValueFromScratch: { state } });
        let score: number = 0;

        for (let x: number = 0; x < 7; x++) {
            // for every column, starting from the bottom of each column
            for (let y: number = 5; y !== -1 && state.board[y][x].isPlayer(); y--) {
                // while we haven't reached the top or an empty space
                const tmpScore: number = P4Rules.getSquareScore(state, new Coord(x, y));
                if (MGPNode.getScoreStatus(tmpScore) !== SCORE.DEFAULT) {
                    // if we find a pre-victory
                    display(P4Rules.VERBOSE, { preVictoryOrVictory: { state, tmpScore, coord: { x, y } } });
                    return new BoardValue(tmpScore); // we return it
                    // TODO check that PRE_VICTORY does not overwrite VICTORY in this case
                    // It seems possible to have a pre victory on one column, and a victory on the next
                }
                score += tmpScore;
            }
        }
        return new BoardValue(score);
    }
    public static getLowestUnoccupiedSpace(board: Table<PlayerOrNone>, x: number): number {
        let y: number = 0;
        while (y < 6 && board[y][x] === PlayerOrNone.NONE) {
            y++;
        }
        return y - 1;
    }
    public static getSquareScore(state: P4State, coord: Coord): number {
        display(P4Rules.VERBOSE, 'getSquareScore(board, ' + coord.x + ', ' + coord.y + ') called');
        const board: Table<PlayerOrNone> = state.board;
        display(P4Rules.VERBOSE, board);
        return P4Rules.P4_HELPER.getSquareScore(state, coord);
    }
    public static getListMoves(node: P4Node): P4Move[] {
        display(P4Rules.VERBOSE, { context: 'P4Rules.getListMoves', node });

        // should be called only if the game is not over
        const originalState: P4State = node.gameState;
        const moves: P4Move[] = [];

        for (let x: number = 0; x < 7; x++) {
            if (originalState.getPieceAtXY(x, 0) === PlayerOrNone.NONE) {
                const move: P4Move = P4Move.of(x);
                moves.push(move);
            }
        }
        return moves;
    }
    public static getBoardValue(state: P4State): BoardValue {
        display(P4Rules.VERBOSE, {
            text: 'P4Rules.getBoardValue called',
            board: state.getCopiedBoard(),
        });
        return P4Rules.getBoardValueFromScratch(state);
    }
    public applyLegalMove(move: P4Move, state: P4State, _status: void): P4State
    {
        const x: number = move.x;
        const board: PlayerOrNone[][] = state.getCopiedBoard();
        const y: number = P4Rules.getLowestUnoccupiedSpace(board, x);

        const turn: number = state.turn;

        board[y][x] = state.getCurrentPlayer();

        const resultingState: P4State = new P4State(board, turn+1);
        return resultingState;
    }
    public isLegal(move: P4Move, state: P4State): MGPFallible<void> {
        display(P4Rules.VERBOSE, { context: 'P4Rules.isLegal', move: move.toString(), state });
        if (state.getPieceAtXY(move.x, 0).isPlayer()) {
            return MGPFallible.failure(P4Failure.COLUMN_IS_FULL());
        }
        return MGPFallible.success(undefined);
    }
    public getGameStatus(node: P4Node): GameStatus {
        const state: P4State = node.gameState;
        for (let x: number = 0; x < 7; x++) {
            // for every column, starting from the bottom of each column
            for (let y: number = 5; y >= 0 && state.board[y][x].isPlayer(); y--) {
                // while we haven't reached the top or an empty space
                const tmpScore: number = P4Rules.getSquareScore(state, new Coord(x, y));
                if (MGPNode.getScoreStatus(tmpScore) === SCORE.VICTORY) {
                    return GameStatus.getVictory(state.getCurrentOpponent());
                }
            }
        }
        return state.turn === 42 ? GameStatus.DRAW : GameStatus.ONGOING;
    }
}
