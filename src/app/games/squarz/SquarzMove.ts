import { Encoder, MGPFallible } from '@everyboard/lib';

import { Coord } from '../../../app/jscaip/Coord';
import { MoveCoordToCoord } from '../../../app/jscaip/MoveCoordToCoord';
import { MoveWithTwoCoords } from '../../../app/jscaip/MoveWithTwoCoords';
import { RulesFailure } from '../../../app/jscaip/RulesFailure';

export class SquarzMove extends MoveCoordToCoord {

    public static encoder: Encoder<SquarzMove> = MoveWithTwoCoords.getFallibleEncoder(SquarzMove.from);

    public static from(start: Coord, end: Coord): MGPFallible<SquarzMove> {
        const distance: number = start.getDistanceToward(end);
        if (distance === 0) {
            return MGPFallible.failure(RulesFailure.MOVE_CANNOT_BE_STATIC());
        } else {
            return MGPFallible.success(new SquarzMove(start, end));
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
