import { Encoder } from 'src/app/utils/Encoder';
import { Utils } from 'src/app/utils/utils';
import { MancalaDistribution, MancalaMove } from '../commons/MancalaMove';

export class AwaleMove extends MancalaMove {

    public static readonly ZERO: AwaleMove = new AwaleMove(0);

    public static readonly ONE: AwaleMove = new AwaleMove(1);

    public static readonly TWO: AwaleMove = new AwaleMove(2);

    public static readonly THREE: AwaleMove = new AwaleMove(3);

    public static readonly FOUR: AwaleMove = new AwaleMove(4);

    public static readonly FIVE: AwaleMove = new AwaleMove(5);

    public static encoder: Encoder<AwaleMove> = Encoder.tuple(
        [Encoder.identity<number>()],
        (coord: AwaleMove) => [coord.x],
        (value: [number]) => AwaleMove.of(value[0]),
    );
    public static of(x: number): AwaleMove {
        switch (x) {
            case 0: return AwaleMove.ZERO;
            case 1: return AwaleMove.ONE;
            case 2: return AwaleMove.TWO;
            case 3: return AwaleMove.THREE;
            case 4: return AwaleMove.FOUR;
            default:
                Utils.expectToBe(x, 5, 'Invalid x for AwaleMove: ' + x);
                return AwaleMove.FIVE;
        }
    }
    private constructor(public readonly x: number) {
        super([MancalaDistribution.of(x)]);
    }
    public equals(other: AwaleMove): boolean {
        if (other === this) return true;
        return other.x === this.x;
    }
    public toString(): string {
        return 'AwaleMove(' + this.x + ')';
    }
}
