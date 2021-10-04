import { RectangularGameState } from '../../jscaip/RectangularGameState';
import { QuartoPiece } from './QuartoPiece';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';

export class QuartoState extends RectangularGameState<QuartoPiece> {

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
        return QuartoState.isPlacable(piece, board);
    }
    public static isPlacable(piece: QuartoPiece, board: Table<QuartoPiece>): boolean {
        // return true if the pawn is not already placed on the board
        let found: boolean = false;
        let indexY: number = 0;
        let indexX: number;
        while (!found && (indexY < 4)) {
            indexX = 0;
            while (!found && (indexX < 4)) {
                found = board[indexY][indexX] === piece;
                indexX++;
            }
            indexY++;
        }
        return !found;
    }
    public getRemainingPawns(): Array<QuartoPiece> {
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
