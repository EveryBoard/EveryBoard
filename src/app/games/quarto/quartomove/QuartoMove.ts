import { MoveCoord } from '../../../jscaip/MoveCoord';
import { QuartoPiece } from '../QuartoPiece';

export class QuartoMove extends MoveCoord {
    public static encode(move: QuartoMove): number {
        /* x va de 0 à 3
         * y va de 0 à 3
         * p va de 0 à 16 compris, 16 pour le dernier tour
         */
        const x: number = move.coord.x;
        const y: number = move.coord.y;
        const p: number = move.piece.value;
        return (x * 128) + (y * 32) + p;
    }
    public static decode(encodedMove: number): QuartoMove {
        // traduit en UN entier le pion choisis, encodé sous la forme binaire
        // xx yy pppp p
        const piece: number = encodedMove % 32; // résultat de 0 à 16
        encodedMove -= piece;
        encodedMove /= 32;
        const y: number = encodedMove % 4;
        encodedMove -= y;
        encodedMove /= 4;
        const x: number = encodedMove;
        return new QuartoMove(x, y, QuartoPiece.fromInt(piece));
    }
    constructor(x: number, y: number, public readonly piece: QuartoPiece) {
        /* (x, y) is the coord where you put the 'inHand' quarto piece
         * piece is the quarto piece you give
         */
        super(x, y);
        if (piece == null) {
            throw new Error('Piece to give can\'t be null.');
        }
    }
    public encode(): number {
        return QuartoMove.encode(this);
    }
    public decode(xyp: number): QuartoMove {
        return QuartoMove.decode(xyp);
    }
    public toString(): string {
        return 'QuartoMove(' + this.coord.x + ', ' +
                             this.coord.y + ', ' +
                             this.piece.value +
                ')';
    }
    public equals(o: QuartoMove): boolean {
        if (this === o) return true;
        const other: QuartoMove = o as QuartoMove;
        if (!other.coord.equals(this.coord)) return false;
        return this.piece === other.piece;
    }
}
