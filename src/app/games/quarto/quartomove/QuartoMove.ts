import {MoveCoord} from '../../../jscaip/MoveCoord';

export class QuartoMove extends MoveCoord {

    readonly piece: number;

    constructor(x: number, y: number, piece: number) {
        /* (x, y) is the coord where you put the 'inHand' quarto piece
         * piece is the quarto piece you give
         */
        super(x, y);
        if (piece == null) throw new Error("Piece cannot be null");
        this.piece = piece;

    }
    public encode(): number {
        /* x va de 0 à 3
         * y va de 0 à 3
         * p va de 0 à 16 compris, 16 pour le dernier tour
         */
        const x: number = this.coord.x;
        const y: number = this.coord.y;
        const p: number = this.piece;
        return (x * 128) + (y * 32) + p;
    }
    public static decode(encodedMove: number): QuartoMove {
        // traduit en UN entier le pion choisis, encodé sous la forme binaire
        // xx yy ppppp
        const piece: number = encodedMove % 32; // résultat de 0 à 16
        encodedMove -= piece;
        encodedMove /= 32;
        const y: number = encodedMove % 4;
        encodedMove -= y;
        encodedMove /= 4;
        const x: number = encodedMove;
        return new QuartoMove(x, y, piece);
    }
    public decode(xyp: number): QuartoMove {
        return QuartoMove.decode(xyp);
    }
    public toString(): String {
        return 'QuartoMove{' + 'piece=' + this.piece
                             + ' at (' + this.coord.x
                             + ', ' + this.coord.y +
                ')}';
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