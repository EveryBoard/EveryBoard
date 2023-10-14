import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Direction } from 'src/app/jscaip/Direction';
import { TaflFailure } from './TaflFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPValidation } from 'src/app/utils/MGPValidation';

export abstract class TaflMove extends MoveCoordToCoord {

    public static isValidStartAndEnd(start: Coord, end: Coord, maximalDistance: number): MGPValidation {
        if (start.isNotInRange(maximalDistance, maximalDistance)) {
            return MGPValidation.failure('Starting coord of TaflMove must be on the board, not at ' + start.toString() + '.');
        }
        if (end.isNotInRange(maximalDistance, maximalDistance)) {
            return MGPValidation.failure('Landing coord of TaflMove must be on the board, not at ' + end.toString() + '.');
        }
        const dir: MGPFallible<Direction> = start.getDirectionToward(end);
        if (dir.isFailure() || dir.get().isDiagonal()) {
            return MGPValidation.failure(TaflFailure.MOVE_MUST_BE_ORTHOGONAL());
        }
        return MGPValidation.SUCCESS;
    }

    protected constructor(start: Coord, end: Coord) {
        super(start, end);
    }

    public override toString(): string {
        return 'TaflMove(' + this.getStart() + '->' + this.getEnd() + ')';
    }

}
