import { Move } from 'src/app/jscaip/Move';
import { Encoder } from '@everyboard/lib';
import { Utils } from '@everyboard/lib';

export class MancalaDistribution {

    public static encoder: Encoder<MancalaDistribution> = Encoder.tuple(
        [Encoder.identity<number>()],
        (distribution: MancalaDistribution) => [distribution.x],
        (value: [number]) => MancalaDistribution.of(value[0]),
    );
    public static readonly ZERO: MancalaDistribution = new MancalaDistribution(0);

    public static readonly ONE: MancalaDistribution = new MancalaDistribution(1);

    public static readonly TWO: MancalaDistribution = new MancalaDistribution(2);

    public static readonly THREE: MancalaDistribution = new MancalaDistribution(3);

    public static readonly FOUR: MancalaDistribution = new MancalaDistribution(4);

    public static readonly FIVE: MancalaDistribution = new MancalaDistribution(5);

    public static of(x: number): MancalaDistribution {
        switch (x) {
            case 0: return MancalaDistribution.ZERO;
            case 1: return MancalaDistribution.ONE;
            case 2: return MancalaDistribution.TWO;
            case 3: return MancalaDistribution.THREE;
            case 4: return MancalaDistribution.FOUR;
            default:
                Utils.expectToBe(x, 5, 'Invalid x for AwaleMove: ' + x);
                return MancalaDistribution.FIVE;
        }
    }
    protected constructor(public readonly x: number) {
    }
    public equals(other: MancalaDistribution): boolean {
        if (other === this) return true;
        return other.x === this.x;
    }
}

export abstract class MancalaMove extends Move {

    protected constructor(public readonly distributions: MancalaDistribution[]) {
        super();
    }
    [Symbol.iterator](): IterableIterator<MancalaDistribution> {
        return this.distributions.values();
    }
}
