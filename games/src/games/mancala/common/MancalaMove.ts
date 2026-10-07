import { ArrayUtils, Encoder, Utils } from '@everyboard/lib';

import { Move } from '../../../jscaip/Move';

export class MancalaDistribution {

    public static encoder: Encoder<MancalaDistribution> = Encoder.tuple(
        [Encoder.identity<number>(), Encoder.identity<number>()],
        (distribution: MancalaDistribution) => [distribution.x, distribution.y],
        (value: [number, number]) => MancalaDistribution.of(value[0], value[1]),
    );

    public static of(x: number, y: number): MancalaDistribution {
        Utils.assert(0 <= x, 'MancalaDistribution.x should be a positive integer!');
        Utils.assert(0 <= y, 'MancalaDistribution.y should be a positive integer!');
        return new MancalaDistribution(x, y);
    }

    protected constructor(public readonly x: number, public readonly y: number) {
    }

    public equals(other: MancalaDistribution): boolean {
        if (other === this) return true;
        if (other.x !== this.x) return false;
        return other.y === this.y;
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
        const distributions: string[] = this.distributions.map((move: MancalaDistribution) => '(' + move.x + ', ' + move.y + ')');
        return 'MancalaMove([' + distributions.join(', ') + '])';
    }

    public override equals(other: this): boolean {
        return ArrayUtils.equals(this.distributions, other.distributions);
    }

    public getFirstDistribution(): MancalaDistribution {
        return this.distributions[0];
    }

    public [Symbol.iterator](): IterableIterator<MancalaDistribution> {
        return this.distributions.values();
    }
}
