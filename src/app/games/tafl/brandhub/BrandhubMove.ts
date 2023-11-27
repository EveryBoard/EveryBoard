import { Coord } from 'src/app/jscaip/Coord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { Encoder } from '@everyboard/lib';
import { MGPFallible } from '@everyboard/lib';
import { TaflMove } from '../TaflMove';
import { MGPValidation } from '@everyboard/lib';

export class BrandhubMove extends TaflMove {

    public static encoder: Encoder<BrandhubMove> =
        MoveWithTwoCoords.getFallibleEncoder<BrandhubMove>(BrandhubMove.from);

    public static from(start: Coord, end: Coord): MGPFallible<BrandhubMove> {
        const validity: MGPValidation = TaflMove.isValidDirection(start, end);
        if (validity.isFailure()) {
            return validity.toOtherFallible();
        } else {
            return MGPFallible.success(new BrandhubMove(start, end));
        }
    }

    public getMaximalDistance(): number {
        return 7;
    }
}
