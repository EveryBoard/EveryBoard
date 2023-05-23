import { Direction } from 'src/app/jscaip/Direction';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Coord } from 'src/app/jscaip/Coord';

type EpaminondasMoveFields = [Coord, number, number, Direction];

export class EpaminondasMove extends MoveCoord {
    public static encoder: MoveEncoder<EpaminondasMove> = MoveEncoder.tuple(
        [Coord.encoder, MoveEncoder.identity<number>(), MoveEncoder.identity<number>(), Direction.encoder],
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
        if (this.coord.isNotInRange(14, 12)) {
            throw new Error('Illegal coord outside of board ' + this.coord.toString() + '.');
        }
        if (movedPieces < 1) {
            throw new Error('Must select minimum one piece (got ' + movedPieces + ').');
        }
        if (stepSize < 1) {
            throw new Error('Step size must be minimum one (got ' + stepSize + ').');
        }
        if (stepSize > movedPieces) {
            throw new Error('Cannot move a phalanx further than its size (got step size ' + stepSize + ' for ' + movedPieces+ ' pieces).');
        }
    }
    public toString(): string {
        return 'EpaminondasMove(' + this.coord.toString() + ', m:' +
                                  this.movedPieces + ', s:' +
                                  this.stepSize + ', ' +
                                  this.direction.toString() + ')';
    }
    public override equals(other: EpaminondasMove): boolean {
        if (this === other) return true;
        if (!this.coord.equals(other.coord)) return false;
        if (this.movedPieces !== other.movedPieces) return false;
        if (this.stepSize !== other.stepSize) return false;
        return this.direction.equals(other.direction);
    }
}
