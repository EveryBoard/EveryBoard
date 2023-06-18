import { Move } from 'src/app/jscaip/Move';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MancalaMove } from '../MancalaMove';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class KalahMove extends Move {

    public static encoder: MoveEncoder<KalahMove> = undefined as any; // TODO

    public readonly subMoves: MancalaMove[];

    public constructor(mandatoryMove: MancalaMove, bonusMoves: MancalaMove[] = []) {
        super();
        this.subMoves = [mandatoryMove];
        this.subMoves.push(...bonusMoves);
    }
    public add(move: MancalaMove): KalahMove {
        return new KalahMove(this.subMoves[0],
                             this.subMoves.slice(1).concat(move));
    }
    public toString(): string {
        return 'KalahMove[' + this.subMoves.map((move: MancalaMove) => move.x).join(', ') + ']';
    }
    public equals(other: this): boolean {
        return ArrayUtils.compareArray(this.subMoves, other.subMoves);
    }
    [Symbol.iterator](): IterableIterator<MancalaMove> {
        return this.subMoves.values();
    }
}
