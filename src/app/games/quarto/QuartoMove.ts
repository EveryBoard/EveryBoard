import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { MoveCoord } from '../../jscaip/MoveCoord';
import { QuartoPiece } from './QuartoPiece';

export class QuartoMove extends MoveCoord {
    public static encoder: NumberEncoder<QuartoMove> = new class extends NumberEncoder<QuartoMove> {
        public maxValue(): number {
            return 3 * 128 + 3 * 32 + 16;
        }
        public encodeNumber(move: QuartoMove): number {
            /* x from 0 to 3
             * y from 0 to 3
             * p from 0 to 16 included, 16 for the last turn
             */
            const x: number = move.coord.x;
            const y: number = move.coord.y;
            const p: number = move.piece.value;
            return (x * 128) + (y * 32) + p;
        }
        public decodeNumber(encodedMove: number): QuartoMove {
            // translates in an integer the chosen piece, encoded in binary form
            // xx yy pppp p
            const piece: number = encodedMove % 32; // result from 0 to 16
            encodedMove -= piece;
            encodedMove /= 32;
            const y: number = encodedMove % 4;
            encodedMove -= y;
            encodedMove /= 4;
            const x: number = encodedMove;
            return new QuartoMove(x, y, QuartoPiece.fromInt(piece));
        }
    };
    constructor(x: number, y: number, public readonly piece: QuartoPiece) {
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
    public equals(o: QuartoMove): boolean {
        if (this === o) return true;
        if (!o.coord.equals(this.coord)) return false;
        return this.piece === o.piece;
    }
}
