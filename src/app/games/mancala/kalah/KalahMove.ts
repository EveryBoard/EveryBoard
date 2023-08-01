import { Encoder } from 'src/app/utils/Encoder';
import { MancalaDistribution, MancalaMove } from '../commons/MancalaMove';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class KalahMove extends MancalaMove {

    public static encoder: Encoder<KalahMove> = Encoder.tuple(
        [Encoder.list(MancalaDistribution.encoder)],
        (move: KalahMove) => [move.subMoves],
        (value: [MancalaDistribution[]]) => KalahMove.of(value[0][0], value[0].slice(1)),
    );
    public static of(mandatoryMove: MancalaDistribution, bonusMoves: MancalaDistribution[] = []): KalahMove {
        const subMoves: MancalaDistribution[] = [mandatoryMove];
        subMoves.push(...bonusMoves);
        return new KalahMove(subMoves);
    }
    public add(move: MancalaDistribution): KalahMove {
        return KalahMove.of(this.subMoves[0],
                            this.subMoves.slice(1).concat(move));
    }
    public override toString(): string {
        return 'KalahMove[' + this.subMoves.map((move: MancalaDistribution) => move.x).join(', ') + ']';
    }
    public override equals(other: this): boolean {
        return ArrayUtils.compareArray(this.subMoves, other.subMoves);
    }
}
// TODO: fin de partie que dans le kalah devrait proposer le move
// TODO: 15 + 1 serait écrit 16 + 1 à la place (comme les captures sont 0 -2)
// TODO: Faut voir l'animation lo