import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MGPCanFail } from 'src/app/utils/MGPCanFail';
import { JSONValue } from 'src/app/utils/utils';
import { LinesOfActionState } from './LinesOfActionState';

export class LinesOfActionMove extends MoveCoordToCoord {
    public static encoder: NumberEncoder<LinesOfActionMove> =
        MoveCoordToCoord.getEncoder<LinesOfActionMove>(LinesOfActionState.SIZE, LinesOfActionState.SIZE,
                                                       (start: Coord, end: Coord): LinesOfActionMove => {
                                                           return LinesOfActionMove.of(start, end).get();
                                                       });

    public static of(start: Coord, end: Coord): MGPCanFail<LinesOfActionMove> {
        const directionOptional: MGPCanFail<Direction> = Direction.factory.fromMove(start, end);
        if (directionOptional.isFailure()) {
            return MGPCanFail.failure(directionOptional.getReason());
        }
        if (!start.isInRange(LinesOfActionState.SIZE, LinesOfActionState.SIZE)) {
            return MGPCanFail.failure('start coord is not in range');
        }
        if (!end.isInRange(LinesOfActionState.SIZE, LinesOfActionState.SIZE)) {
            return MGPCanFail.failure('end coord is not in range');
        }
        return MGPCanFail.success(new LinesOfActionMove(start, end, directionOptional.get()));
    }
    private constructor(start: Coord, end: Coord, public readonly direction: Direction) {
        super(start, end);
        this.direction = Direction.factory.fromMove(start, end).get();
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
