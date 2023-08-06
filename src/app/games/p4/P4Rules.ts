import { Coord } from '../../jscaip/Coord';
import { Rules } from '../../jscaip/Rules';
import { GameNode } from '../../jscaip/MGPNode';
import { P4State } from './P4State';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Utils, Debug } from 'src/app/utils/utils';
import { P4Move } from './P4Move';
import { Table } from 'src/app/utils/ArrayUtils';
import { P4Failure } from './P4Failure';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class P4Node extends GameNode<P4Move, P4State> {}

@Debug.log
export class P4Rules extends Rules<P4Move, P4State> {

    private static singleton: MGPOptional<P4Rules> = MGPOptional.empty();

    public static readonly P4_HELPER: NInARowHelper<PlayerOrNone> =
        new NInARowHelper(P4Rules.isInRange, Utils.identity, 4);

    public static get(): P4Rules {
        if (P4Rules.singleton.isAbsent()) {
            P4Rules.singleton = MGPOptional.of(new P4Rules());
        }
        return P4Rules.singleton.get();
    }
    public static isInRange(coord: Coord): boolean {
        return coord.isInRange(7, 6);
    }
    public static getVictoriousCoords(state: P4State): Coord[] {
        return P4Rules.P4_HELPER.getVictoriousCoord(state);
    }
    public static getLowestUnoccupiedSpace(board: Table<PlayerOrNone>, x: number): number {
        let y: number = 0;
        while (y < 6 && board[y][x] === PlayerOrNone.NONE) {
            y++;
        }
        return y - 1;
    }
    public static getListMoves(node: P4Node): P4Move[] {
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
    private constructor() {
        super(P4State);
    }
    public applyLegalMove(move: P4Move, state: P4State, _info: void): P4State {
        const x: number = move.x;
        const board: PlayerOrNone[][] = state.getCopiedBoard();
        const y: number = P4Rules.getLowestUnoccupiedSpace(board, x);

        const turn: number = state.turn;

        board[y][x] = state.getCurrentPlayer();

        const resultingState: P4State = new P4State(board, turn + 1);
        return resultingState;
    }
    public isLegal(move: P4Move, state: P4State): MGPValidation {
        if (state.getPieceAtXY(move.x, 0).isPlayer()) {
            return MGPValidation.failure(P4Failure.COLUMN_IS_FULL());
        }
        return MGPValidation.SUCCESS;
    }
    public getGameStatus(node: P4Node): GameStatus {
        const state: P4State = node.gameState;
        const victoriousCoord: Coord[] = P4Rules.P4_HELPER.getVictoriousCoord(state);
        if (victoriousCoord.length > 0) {
            return GameStatus.getVictory(state.getCurrentOpponent());
        }
        return state.turn === 42 ? GameStatus.DRAW : GameStatus.ONGOING;
    }
}
