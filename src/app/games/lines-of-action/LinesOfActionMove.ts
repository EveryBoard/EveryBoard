import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { NumberEncoder } from 'src/app/jscaip/encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { JSONValue } from 'src/app/utils/utils';
import { LinesOfActionState } from './LinesOfActionState';

export class LinesOfActionMove extends MoveCoordToCoord {
    public static encoder: NumberEncoder<LinesOfActionMove> =
        MoveCoordToCoord.getEncoder<LinesOfActionMove>(LinesOfActionState.SIZE, LinesOfActionState.SIZE,
                                                       (start: Coord, end: Coord): LinesOfActionMove => {
                                                           return new LinesOfActionMove(start, end);
                                                       });

    public readonly direction: Direction;
    public constructor(start: Coord, end: Coord) {
        super(start, end);
        if (!start.isInRange(LinesOfActionState.SIZE, LinesOfActionState.SIZE)) {
            throw new Error('Starting coord of LinesOfActionMove must be on the board');
        }
        if (!end.isInRange(LinesOfActionState.SIZE, LinesOfActionState.SIZE)) {
            throw new Error('End coord of LinesOfActionMove must be on the board');
        }
        this.direction = Direction.factory.fromMove(start, end);
    }
    public equals(o: LinesOfActionMove): boolean {
        if (o === this) return true;
        if (!o.coord.equals(this.coord)) return false;
        return o.end.equals(this.end);
    }
    public toString(): string {
        return 'LinesOfActionMove(' + this.coord + '->' + this.end + ')';
    }
    public encode(): JSONValue {
        return LinesOfActionMove.encoder.encode(this);
    }
    public decode(encodedMove: JSONValue): LinesOfActionMove {
        return LinesOfActionMove.encoder.decode(encodedMove);
    }

}
