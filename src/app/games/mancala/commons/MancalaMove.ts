import { MoveEncoder } from 'src/app/utils/Encoder';
import { Move } from 'src/app/jscaip/Move';
import { assert } from 'src/app/utils/assert';
import { JSONValueWithoutArray } from 'src/app/utils/utils';

export class MancalaMove extends Move {

    public static readonly ZERO: MancalaMove = new MancalaMove(0);

    public static readonly ONE: MancalaMove = new MancalaMove(1);

    public static readonly TWO: MancalaMove = new MancalaMove(2);

    public static readonly THREE: MancalaMove = new MancalaMove(3);

    public static readonly FOUR: MancalaMove = new MancalaMove(4);

    public static readonly FIVE: MancalaMove = new MancalaMove(5);

    public static encoder: MoveEncoder<MancalaMove> = new class extends MoveEncoder<MancalaMove> {
        public encodeMove(move: MancalaMove): JSONValueWithoutArray {
            return move.x;
        }
        public decodeMove(encoded: JSONValueWithoutArray): MancalaMove {
            return MancalaMove.from(encoded as number);
        }
    };

    public static from(x: number): MancalaMove {
        switch (x) {
            case 0: return MancalaMove.ZERO;
            case 1: return MancalaMove.ONE;
            case 2: return MancalaMove.TWO;
            case 3: return MancalaMove.THREE;
            case 4: return MancalaMove.FOUR;
            default:
                assert(x === 5, 'Invalid x for MancalaMove: ' + x);
                return MancalaMove.FIVE;
        }
    }
    private constructor(public readonly x: number) {
        super();
    }
    public equals(other: MancalaMove): boolean {
        if (other === this) return true;
        return other.x === this.x;
    }
    public toString(): string {
        return 'MancalaMove(' + this.x + ')';
    }
}
