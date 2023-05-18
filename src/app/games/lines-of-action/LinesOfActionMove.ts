import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { JSONValue } from 'src/app/utils/utils';
import { LinesOfActionState } from './LinesOfActionState';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';

export class LinesOfActionMove extends MoveCoordToCoord {
    public static encoder: MoveEncoder<LinesOfActionMove> =
        MoveWithTwoCoords.getEncoder<LinesOfActionMove>(LinesOfActionMove.from);

    public static from(start: Coord, end: Coord): MGPFallible<LinesOfActionMove> {
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
    public equals(other: LinesOfActionMove): boolean {
        if (other === this) return true;
        if (!other.getStart().equals(this.getStart())) return false;
        return other.getEnd().equals(this.getEnd());
    }
    public override toString(): string {
        return 'LinesOfActionMove(' + this.getStart() + '->' + this.getEnd() + ')';
    }
    public encode(): JSONValue {
        return LinesOfActionMove.encoder.encode(this);
    }
    public decode(encodedMove: JSONValue): LinesOfActionMove {
        return LinesOfActionMove.encoder.decode(encodedMove);
    }

}
