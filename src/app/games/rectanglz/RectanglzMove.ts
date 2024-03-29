import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

export class RectanglzMove extends MoveCoordToCoord {

    public static encoder: Encoder<RectanglzMove> = MoveWithTwoCoords.getFallibleEncoder(RectanglzMove.from);

    public static from(start: Coord, end: Coord): MGPFallible<RectanglzMove> {
        const distance: number = start.getDistanceToward(end);
        if (distance === 0) {
            return MGPFallible.failure(RulesFailure.MOVE_CANNOT_BE_STATIC());
        } else {
            return MGPFallible.success(new RectanglzMove(start, end));
        }
    }

    public isDuplication(): boolean {
        const distance: number = this.getDistance();
        return distance === 1;
    }

    public isJump(): boolean {
        const distance: number = this.getDistance();
        return distance > 1;
    }

    public getDistance(): number {
        return this.getStart().getDistanceToward(this.getEnd());
    }

}
