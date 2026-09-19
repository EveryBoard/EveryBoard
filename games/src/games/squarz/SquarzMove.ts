import { Encoder, MGPFallible } from '@everyboard/lib';

import { Coord } from '../../jscaip/Coord';
import { MoveCoordToCoord } from '../../jscaip/MoveCoordToCoord';
import { MoveWithTwoCoords } from '../../jscaip/MoveWithTwoCoords';
import { RulesFailure } from '../../jscaip/RulesFailure';

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

}
