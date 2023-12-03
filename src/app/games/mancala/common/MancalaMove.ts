import { Move } from 'src/app/jscaip/Move';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Encoder } from 'src/app/utils/Encoder';
import { Utils } from 'src/app/utils/utils';

export class MancalaDistribution {

    public static encoder: Encoder<MancalaDistribution> = Encoder.tuple(
        [Encoder.identity<number>()],
        (distribution: MancalaDistribution) => [distribution.x],
        (value: [number]) => MancalaDistribution.of(value[0]),
    );

    public static of(x: number): MancalaDistribution {
        Utils.assert(0 <= x, 'MancalaDistribution should be a positive integer!');
        return new MancalaDistribution(x);
    }
    protected constructor(public readonly x: number) {
    }
    public equals(other: MancalaDistribution): boolean {
        if (other === this) return true;
        return other.x === this.x;
    }
}

export class MancalaMove extends Move {

    public static encoder: Encoder<MancalaMove> = Encoder.tuple(
        [Encoder.list(MancalaDistribution.encoder)],
        (move: MancalaMove) => [move.distributions],
        (value: [MancalaDistribution[]]) => MancalaMove.of(value[0][0], value[0].slice(1)),
    );

    public static of(mandatoryDistribution: MancalaDistribution, bonusDistributions: MancalaDistribution[] = [])
    : MancalaMove
    {
        const distributions: MancalaDistribution[] = [mandatoryDistribution];
        distributions.push(...bonusDistributions);
        return new MancalaMove(distributions);
    }

    protected constructor(public readonly distributions: MancalaDistribution[]) {
        super();
        Utils.assert(distributions.length > 0, 'Move should have distribution ');
    }

    public add(move: MancalaDistribution): MancalaMove {
        return MancalaMove.of(this.distributions[0],
                              this.distributions.slice(1).concat(move));
    }

    public override toString(): string {
        const distributions: number[] = this.distributions.map((move: MancalaDistribution) => move.x);
        return 'MancalaMove([' + distributions.join(', ') + '])';
    }

    public override equals(other: this): boolean {
        return ArrayUtils.compare(this.distributions, other.distributions);
    }

    public getFirstDistribution(): MancalaDistribution {
        return this.distributions[0];
    }

    [Symbol.iterator](): IterableIterator<MancalaDistribution> {
        return this.distributions.values();
    }
}
