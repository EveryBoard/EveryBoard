import { Encoder } from 'src/app/utils/Encoder';
import { MancalaDistribution, MancalaMove } from '../common/MancalaMove';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class KalahMove extends MancalaMove {

    public static encoder: Encoder<KalahMove> = Encoder.tuple(
        [Encoder.list(MancalaDistribution.encoder)],
        (move: KalahMove) => [move.distributions],
        (value: [MancalaDistribution[]]) => KalahMove.of(value[0][0], value[0].slice(1)),
    );
    public static of(mandatoryDistribution: MancalaDistribution, bonusDistributionns: MancalaDistribution[] = [])
    : KalahMove
    {
        const distributions: MancalaDistribution[] = [mandatoryDistribution];
        distributions.push(...bonusDistributionns);
        return new KalahMove(distributions);
    }
    public add(move: MancalaDistribution): KalahMove {
        return KalahMove.of(this.distributions[0],
                            this.distributions.slice(1).concat(move));
    }
    public override toString(): string {
        const distributions: number[] = this.distributions.map((move: MancalaDistribution) => move.x);
        return 'KalahMove([' + distributions.join(', ') + '])';
    }
    public override equals(other: this): boolean {
        return ArrayUtils.compare(this.distributions, other.distributions);
    }
}
