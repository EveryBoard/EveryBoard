import { Coord } from 'src/app/jscaip/Coord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { Encoder } from '@everyboard/lib';
import { MGPFallible } from '@everyboard/lib';
import { TaflMove } from '../TaflMove';
import { MGPValidation } from '@everyboard/lib';

export class HnefataflMove extends TaflMove {

    public static encoder: Encoder<HnefataflMove> =
        MoveWithTwoCoords.getFallibleEncoder<HnefataflMove>(HnefataflMove.from);

    public static from(start: Coord, end: Coord): MGPFallible<HnefataflMove> {
        const validity: MGPValidation = TaflMove.isValidDirection(start, end);
        if (validity.isFailure()) {
            return validity.toOtherFallible();
        } else {
            return MGPFallible.success(new HnefataflMove(start, end));
        }
    }

    public getMaximalDistance(): number {
        return 11;
    }
}
