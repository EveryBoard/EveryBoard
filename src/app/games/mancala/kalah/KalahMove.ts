import { Encoder } from 'src/app/utils/Encoder';
import { MancalaDistribution, MancalaMove } from '../commons/MancalaMove';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class KalahMove extends MancalaMove {

    public static encoder: Encoder<KalahMove> = Encoder.tuple(
        [Encoder.list(MancalaDistribution.encoder)],
        (move: KalahMove) => [move.distributions],
        (value: [MancalaDistribution[]]) => KalahMove.of(value[0][0], value[0].slice(1)),
    );
    public static of(mandatoryMove: MancalaDistribution, bonusMoves: MancalaDistribution[] = []): KalahMove {
        const distributions: MancalaDistribution[] = [mandatoryMove];
        distributions.push(...bonusMoves);
        return new KalahMove(distributions);
    }
    public add(move: MancalaDistribution): KalahMove {
        return KalahMove.of(this.distributions[0],
                            this.distributions.slice(1).concat(move));
    }
    public override toString(): string {
        return 'KalahMove([' + this.distributions.map((move: MancalaDistribution) => move.x).join(', ') + '])';
    }
    public override equals(other: this): boolean {
        return ArrayUtils.compareArray(this.distributions, other.distributions);
    }
}
