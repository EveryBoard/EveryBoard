import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { RectanglzFailure } from './RectanglzFailure';

export class RectanglzMove extends MoveCoordToCoord {

    public static from(start: Coord, end: Coord): MGPFallible<RectanglzMove> {
        const distance: number = start.getDistanceToward(end);
        if (distance < 3) {
            return MGPFallible.success(new RectanglzMove(start, end));
        } else {
            return MGPFallible.failure(RectanglzFailure.MAX_DISTANCE_IS_2());
        }
    }

    public static encoder: Encoder<RectanglzMove> = undefined as any;

}
