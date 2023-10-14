import { Coord } from 'src/app/jscaip/Coord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TaflMove } from '../TaflMove';
import { MGPValidation } from 'src/app/utils/MGPValidation';

export class HnefataflMove extends TaflMove {

    public static encoder: Encoder<HnefataflMove> =
        MoveWithTwoCoords.getFallibleEncoder<HnefataflMove>(HnefataflMove.from);

    public static from(start: Coord, end: Coord): MGPFallible<HnefataflMove> {
        const validity: MGPValidation = TaflMove.isValidStartAndEnd(start, end, 11);
        if (validity.isFailure()) {
            return validity.toOtherFallible();
        } else {
            return MGPFallible.success(new HnefataflMove(start, end));
        }
    }
}
