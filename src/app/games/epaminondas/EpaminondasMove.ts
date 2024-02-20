import { Direction } from 'src/app/jscaip/Direction';
import { Encoder } from '@everyboard/lib';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Coord } from 'src/app/jscaip/Coord';
import { Utils } from '@everyboard/lib';
import { EpaminondasState } from './EpaminondasState';

type EpaminondasMoveFields = [Coord, number, number, Direction];

export class EpaminondasMove extends MoveCoord {

    public static encoder: Encoder<EpaminondasMove> = Encoder.tuple(
        [Coord.encoder, Encoder.identity<number>(), Encoder.identity<number>(), Direction.encoder],
        (m: EpaminondasMove): EpaminondasMoveFields => [m.coord, m.movedPieces, m.stepSize, m.direction],
        (fields: EpaminondasMoveFields): EpaminondasMove =>
            new EpaminondasMove(fields[0].x, fields[0].y, fields[1], fields[2], fields[3]));

    public constructor(x: number,
                       y: number,
                       public readonly movedPieces: number,
                       public readonly stepSize: number,
                       public readonly direction: Direction)
    {
        super(x, y);
        Utils.assert(movedPieces > 0, 'Must select minimum one piece (got ' + movedPieces + ').');
        Utils.assert(stepSize > 0, 'Step size must be minimum one (got ' + stepSize + ').');
        Utils.assert(stepSize <= movedPieces, 'Cannot move a phalanx further than its size (got step size ' + stepSize + ' for ' + movedPieces+ ' pieces).');
    }
    public toString(): string {
        return 'EpaminondasMove(' + this.coord.toString() + ', m:' +
                                  this.movedPieces + ', s:' +
                                  this.stepSize + ', ' +
                                  this.direction.toString() + ')';
    }
    public override equals(other: EpaminondasMove): boolean {
        if (this === other) return true;
        if (this.coord.equals(other.coord) === false) return false;
        if (this.movedPieces !== other.movedPieces) return false;
        if (this.stepSize !== other.stepSize) return false;
        return this.direction.equals(other.direction);
    }
}
