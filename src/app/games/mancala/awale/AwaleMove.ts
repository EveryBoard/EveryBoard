import { MoveEncoder } from 'src/app/utils/Encoder';
import { MancalaDistribution, MancalaMove } from '../commons/MancalaMove';
import { JSONValueWithoutArray, Utils } from 'src/app/utils/utils';

export class AwaleMove extends MancalaMove {

    public static readonly ZERO: AwaleMove = new AwaleMove(MancalaDistribution.ZERO);

    public static readonly ONE: AwaleMove = new AwaleMove(MancalaDistribution.ONE);

    public static readonly TWO: AwaleMove = new AwaleMove(MancalaDistribution.TWO);

    public static readonly THREE: AwaleMove = new AwaleMove(MancalaDistribution.THREE);

    public static readonly FOUR: AwaleMove = new AwaleMove(MancalaDistribution.FOUR);

    public static readonly FIVE: AwaleMove = new AwaleMove(MancalaDistribution.FIVE);

    public static encoder: MoveEncoder<AwaleMove> = new class extends MoveEncoder<AwaleMove> {
        public encodeMove(move: AwaleMove): JSONValueWithoutArray {
            return move.x;
        }
        public decodeMove(encoded: JSONValueWithoutArray): AwaleMove {
            return AwaleMove.of(encoded as number);
        }
    };
    public static of(x: number): AwaleMove {
        switch (x) {
            case 0: return AwaleMove.ZERO;
            case 1: return AwaleMove.ONE;
            case 2: return AwaleMove.TWO;
            case 3: return AwaleMove.THREE;
            case 4: return AwaleMove.FOUR;
            default:
                Utils.assert(x === 5, 'Invalid x for AwaleMove: ' + x);
                return AwaleMove.FIVE;
        }
    }
    public readonly x: number;

    protected constructor(distribution: MancalaDistribution) {
        super([distribution]);
        this.x = distribution.x;
    }
    public equals(other: AwaleMove): boolean {
        if (other === this) return true;
        return other.subMoves[0].x === this.subMoves[0].x;
    }
    public toString(): string {
        return 'AwaleMove(' + this.subMoves[0].x + ')';
    }
}
