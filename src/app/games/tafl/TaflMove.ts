import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Direction } from 'src/app/jscaip/Direction';
import { TaflFailure } from './TaflFailure';
import { MGPFallible } from '@everyboard/lib';
import { MGPValidation } from '@everyboard/lib';
import { Utils } from '@everyboard/lib';

export abstract class TaflMove extends MoveCoordToCoord {

    public static isValidDirection(start: Coord, end: Coord): MGPValidation {
        const dir: MGPFallible<Direction> = start.getDirectionToward(end);
        if (dir.isFailure() || dir.get().isDiagonal()) {
            return MGPValidation.failure(TaflFailure.MOVE_MUST_BE_ORTHOGONAL());
        }
        return MGPValidation.SUCCESS;
    }

    protected constructor(start: Coord, end: Coord) {
        super(start, end);
        const maximalDistance: number = this.getMaximalDistance();
        Utils.assert(start.isInRange(maximalDistance, maximalDistance),
                     'Starting coord of TaflMove must be on the board, not at ' + start.toString() + '.');
        Utils.assert(end.isInRange(maximalDistance, maximalDistance),
                     'Landing coord of TaflMove must be on the board, not at ' + end.toString() + '.');
    }

    public override toString(): string {
        return 'TaflMove(' + this.getStart() + '->' + this.getEnd() + ')';
    }

    public abstract getMaximalDistance(): number;
}
