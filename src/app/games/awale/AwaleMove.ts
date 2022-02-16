import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { Move } from 'src/app/jscaip/Move';
import { assert } from 'src/app/utils/utils';

export class AwaleMove extends Move {

    public static readonly ZERO: AwaleMove = new AwaleMove(0);

    public static readonly ONE: AwaleMove = new AwaleMove(1);

    public static readonly TWO: AwaleMove = new AwaleMove(2);

    public static readonly THREE: AwaleMove = new AwaleMove(3);

    public static readonly FOUR: AwaleMove = new AwaleMove(4);

    public static readonly FIVE: AwaleMove = new AwaleMove(5);

    public static from(x: number): AwaleMove {
        switch (x) {
            case 0: return AwaleMove.ZERO;
            case 1: return AwaleMove.ONE;
            case 2: return AwaleMove.TWO;
            case 3: return AwaleMove.THREE;
            case 4: return AwaleMove.FOUR;
            default:
                assert(x === 5, 'Invalid x for AwaleMove: ' + x);
                return AwaleMove.FIVE;
        }
    }
    private constructor(public readonly x: number) {
        super();
    }
    public static encoder: NumberEncoder<AwaleMove> = new class extends NumberEncoder<AwaleMove> {
        public maxValue(): number {
            return 5;
        }
        public encodeNumber(move: AwaleMove): number {
            return move.x;
        }
        public decodeNumber(encoded: number): AwaleMove {
            return AwaleMove.from(encoded);
        }
    };
    public equals(o: AwaleMove): boolean {
        if (o === this) return true;
        return o.x === this.x;
    }
    public toString(): string {
        return 'AwaleMove(' + this.x + ')';
    }
}
