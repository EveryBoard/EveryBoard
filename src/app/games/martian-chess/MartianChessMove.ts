import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPValidation } from 'src/app/utils/MGPValidation';

export class MartianChessMoveFailure {

    public static readonly START_COORD_OUT_OF_RANGE: string = 'Start coord cannot be out of range';

    public static readonly END_COORD_OUT_OF_RANGE: string = 'End coord cannot be out of range';
}

export class MartianChessMove extends MoveCoordToCoord {

    public static from(start: Coord, end: Coord): MGPFallible<MartianChessMove> {
        if (start.isNotInRange(4, 8)) {
            return MGPFallible.failure(MartianChessMoveFailure.START_COORD_OUT_OF_RANGE);
        }
        if (end.isNotInRange(4, 8)) {
            return MGPFallible.failure(MartianChessMoveFailure.END_COORD_OUT_OF_RANGE);
        }
        const dir: MGPFallible<Direction> = Direction.factory.fromDelta(end.x - start.x, end.y - start.y);
        if (dir.isFailure()) {
            return MGPFallible.failure(dir.getReason());
        }
        return MGPFallible.success(new MartianChessMove(start, end));
    }
    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public toString(): string {
        throw new Error('Method not implemented.');
    }
    public equals(o: this): boolean {
        throw new Error('Method not implemented.');
    }
}
