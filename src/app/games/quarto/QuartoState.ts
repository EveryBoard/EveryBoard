import { GameStateWithTable } from '../../jscaip/GameStateWithTable';
import { QuartoPiece } from './QuartoPiece';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';

export class QuartoState extends GameStateWithTable<QuartoPiece> {

    constructor(b: Table<QuartoPiece>, turn: number, public readonly pieceInHand: QuartoPiece) {
        super(b, turn);
    }
    public static getInitialState(): QuartoState {
        const board: QuartoPiece[][] = ArrayUtils.createTable(4, 4, QuartoPiece.NONE);
        return new QuartoState(board, 0, QuartoPiece.AAAA);
    }
    public static isGivable(piece: QuartoPiece, board: Table<QuartoPiece>, pieceInHand: QuartoPiece): boolean {
        if (piece === pieceInHand) {
            return false;
        }
        return QuartoState.isAlreadyOnBoard(piece, board) === false;
    }
    public static isAlreadyOnBoard(piece: QuartoPiece, board: Table<QuartoPiece>): boolean {
        // return true if the piece is already placed on the board
        for (let indexY: number = 0; indexY < 4; indexY++) {
            for (let indexX: number = 0; indexX < 4; indexX++) {
                if (board[indexY][indexX] === piece) {
                    return true;
                }
            }
        }
        return false;
    }
    public getRemainingPieces(): Array<QuartoPiece> {
        // return the pawn that are nor on the board nor the one that you have in your hand
        // (hence, the one that your about to put on the board)
        const allPawn: ReadonlyArray<QuartoPiece> = QuartoPiece.pieces;
        const remainingPawns: Array<QuartoPiece> = [];
        for (const piece of allPawn) {
            if (QuartoState.isGivable(piece, this.board, this.pieceInHand)) {
                remainingPawns.push(piece);
            }
        }
        return remainingPawns;
    }
}
