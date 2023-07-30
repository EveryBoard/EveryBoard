import { Coord } from 'src/app/jscaip/Coord';
import { Encoder } from 'src/app/utils/Encoder';
import { MoveCoord } from '../../jscaip/MoveCoord';
import { QuartoPiece } from './QuartoPiece';

export class QuartoMove extends MoveCoord {

    public static encoder: Encoder<QuartoMove> = Encoder.tuple(
        [Coord.encoder, QuartoPiece.encoder],
        (m: QuartoMove): [Coord, QuartoPiece] => [m.coord, m.piece],
        (fields: [Coord, QuartoPiece]): QuartoMove => new QuartoMove(fields[0].x, fields[0].y, fields[1]));

    public constructor(x: number, y: number, public readonly piece: QuartoPiece) {
        /* (x, y) is the coord where you put the 'inHand' quarto piece
         * piece is the quarto piece you give
         */
        super(x, y);
    }
    public toString(): string {
        return 'QuartoMove(' + this.coord.x + ', ' +
                             this.coord.y + ', ' +
                             this.piece.value +
                ')';
    }
    public override equals(other: QuartoMove): boolean {
        if (this === other) return true;
        if (other.coord.equals(this.coord) === false) return false;
        return this.piece === other.piece;
    }
}
