import { MoveEncoder } from 'src/app/utils/Encoder';
import { MancalaDistribution, MancalaMove } from '../commons/MancalaMove';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class KalahMove extends MancalaMove {

    public static encoder: MoveEncoder<KalahMove> = undefined as any; // TODO

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
