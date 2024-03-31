import { Direction } from 'src/app/jscaip/Direction';
import { Encoder } from 'src/app/utils/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Coord } from 'src/app/jscaip/Coord';
import { Utils } from 'src/app/utils/utils';
import { EpaminondasFailure } from './EpaminondasFailure';

type EpaminondasMoveFields = [Coord, number, number, Direction];

export class EpaminondasMove extends MoveCoord {

    public static encoder: Encoder<EpaminondasMove> = Encoder.tuple(
        [Coord.encoder, Encoder.identity<number>(), Encoder.identity<number>(), Direction.encoder],
        (m: EpaminondasMove): EpaminondasMoveFields => [m.coord, m.phalanxSize, m.stepSize, m.direction],
        (fields: EpaminondasMoveFields): EpaminondasMove =>
            new EpaminondasMove(fields[0].x, fields[0].y, fields[1], fields[2], fields[3]));

    public constructor(x: number,
                       y: number,
                       public readonly phalanxSize: number,
                       public readonly stepSize: number,
                       public readonly direction: Direction)
    {
        super(x, y);
        Utils.assert(phalanxSize > 0, 'Must select minimum one piece (got ' + phalanxSize + ').');
        Utils.assert(stepSize > 0, 'Step size must be minimum one (got ' + stepSize + ').');
        Utils.assert(stepSize <= phalanxSize,
                     EpaminondasFailure.PHALANX_CANNOT_JUMP_FURTHER_THAN_ITS_SIZE(stepSize, phalanxSize));
    }

    public toString(): string {
        return 'EpaminondasMove(' + this.coord.toString() + ', m:' +
                                  this.phalanxSize + ', s:' +
                                  this.stepSize + ', ' +
                                  this.direction.toString() + ')';
    }

    public override equals(other: EpaminondasMove): boolean {
        if (this === other) return true;
        if (this.coord.equals(other.coord) === false) return false;
        if (this.phalanxSize !== other.phalanxSize) return false;
        if (this.stepSize !== other.stepSize) return false;
        return this.direction.equals(other.direction);
    }

}
