import { Move } from 'src/app/jscaip/Move';
import { Encoder } from 'src/app/utils/Encoder';
import { Utils } from 'src/app/utils/utils';

export class MancalaDistribution {

    public static encoder: Encoder<MancalaDistribution> = Encoder.tuple(
        [Encoder.identity<number>()],
        (distribution: MancalaDistribution) => [distribution.x],
        (value: [number]) => MancalaDistribution.of(value[0]),
    );

    public static of(x: number): MancalaDistribution {
        Utils.assert(x >= 0, 'MancalaDistribution should be a positive integer!');
        return new MancalaDistribution(x);
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
