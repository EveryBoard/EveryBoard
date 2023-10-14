import { Coord } from 'src/app/jscaip/Coord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TaflMove } from '../TaflMove';
import { MGPValidation } from 'src/app/utils/MGPValidation';

export class TablutMove extends TaflMove {

    public static encoder: Encoder<TablutMove> = MoveWithTwoCoords.getFallibleEncoder<TablutMove>(TablutMove.from);

    public static from(start: Coord, end: Coord): MGPFallible<TablutMove> {
        const validity: MGPValidation = TaflMove.isValidStartAndEnd(start, end, 9);
        if (validity.isFailure()) {
            return validity.toOtherFallible();
        } else {
            return MGPFallible.success(new TablutMove(start, end));
        }
    }
}
