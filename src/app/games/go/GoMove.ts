import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';

export class GoMove extends MoveCoord {
    public static readonly PASS: GoMove = new GoMove(-1, 0);
    public static readonly ACCEPT: GoMove = new GoMove(-2, 0);

    public static readonly PASS_NUMBER: number = -1;
    public static readonly ACCEPT_NUMBER: number = -2;

    public static encoder: NumberEncoder<GoMove> = new class extends NumberEncoder<GoMove> {
        public maxValue(): number {
            return 18*19 + 18;
        }
        public encodeNumber(move: GoMove): number {
            // A go move goes on x from o to 18
            // and y from 0 to 18
            // encoded as y*19 + x
            return (move.coord.y * 19) + move.coord.x;
        }
        public decodeNumber(encodedMove: number): GoMove {
            if (encodedMove === GoMove.PASS_NUMBER) {
                return GoMove.PASS;
            }
            const x: number = encodedMove % 19;
            const y: number = (encodedMove - x) / 19;
            return new GoMove(x, y);
        }
    }
    public equals(o: GoMove): boolean {
        if (this === o) return true;
        return this.coord.equals(o.coord);
    }
    public toString(): string {
        if (this === GoMove.PASS) {
            return 'GoMove.PASS';
        } else if (this === GoMove.ACCEPT) {
            return 'GoMove.ACCEPT';
        } else {
            return 'GoMove(' + this.coord.x + ', ' + this.coord.y + ')';
        }
    }
}
