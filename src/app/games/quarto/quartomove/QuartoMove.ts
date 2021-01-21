import { MoveCoord } from '../../../jscaip/MoveCoord';

export class QuartoMove extends MoveCoord {
    public static encode(move: QuartoMove): number {
        /* x va de 0 à 3
         * y va de 0 à 3
         * p va de 0 à 16 compris, 16 pour le dernier tour
         */
        const x: number = move.coord.x;
        const y: number = move.coord.y;
        const p: number = move.piece;
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
        return new QuartoMove(x, y, piece);
    }
    constructor(x: number, y: number, public readonly piece: number) {
        /* (x, y) is the coord where you put the 'inHand' quarto piece
         * piece is the quarto piece you give
         */
        super(x, y);
        if (piece < 0) {
            // nombre trop bas, ce n'est pas une pièce
            throw new Error('Negative number are not valids pieces (should be betwwen 0 and 15), got ' + piece + '.');
        }
        if (piece > 16) {
            // nombre trop grand, ce n'est pas une pièce
            throw new Error('This number is too big to be a valid piece (should be between 0 and 15), got ' + piece + '.');
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
                             this.piece +
                ')';
    }
    public equals(o: any): boolean {
        if (this === o) return true;
        if (!(o instanceof QuartoMove)) return false;
        const other: QuartoMove = o as QuartoMove;
        if (!other.coord.equals(this.coord)) return false;
        if (this.piece !== other.piece) return false;
        return true;
    }
}
