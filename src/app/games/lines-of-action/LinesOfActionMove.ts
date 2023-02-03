import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { JSONValue } from 'src/app/utils/utils';
import { LinesOfActionState } from './LinesOfActionState';

export class LinesOfActionMove extends MoveCoordToCoord {
    public static encoder: MoveEncoder<LinesOfActionMove> =
        MoveCoordToCoord.getEncoder<LinesOfActionMove>((start: Coord, end: Coord): LinesOfActionMove => {
                                                           return LinesOfActionMove.of(start, end).get();
                                                       });

    public static of(start: Coord, end: Coord): MGPFallible<LinesOfActionMove> {
        const directionOptional: MGPFallible<Direction> = Direction.factory.fromMove(start, end);
        if (directionOptional.isFailure()) {
            return MGPFallible.failure(directionOptional.getReason());
        }
        if (start.isNotInRange(LinesOfActionState.SIZE, LinesOfActionState.SIZE)) {
            return MGPFallible.failure('start coord is not in range');
        }
        if (end.isNotInRange(LinesOfActionState.SIZE, LinesOfActionState.SIZE)) {
            return MGPFallible.failure('end coord is not in range');
        }
        return MGPFallible.success(new LinesOfActionMove(start, end, directionOptional.get()));
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
