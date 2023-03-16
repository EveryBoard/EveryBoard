import { Coord } from 'src/app/jscaip/Coord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TrexoFailure } from './TrexoFailure';
import { TrexoState } from './TrexoState';

/**
 * It's not really a move coord to coord but rather a "drop two coords" (that are neighbor)
 */
export class TrexoMove extends MoveWithTwoCoords {

    public static encoder: MoveEncoder<TrexoMove> = MoveWithTwoCoords.getEncoder(TrexoMove.from);

    public static from(zero: Coord, one: Coord): MGPFallible<TrexoMove> {
        if (zero.isNotInRange(TrexoState.SIZE, TrexoState.SIZE)) {
            return MGPFallible.failure(TrexoFailure.OUT_OF_RANGE_COORD(zero));
        }
        if (one.isNotInRange(TrexoState.SIZE, TrexoState.SIZE)) {
            return MGPFallible.failure(TrexoFailure.OUT_OF_RANGE_COORD(one));
        }
        const distance: number = zero.getOrthogonalDistance(one);
        if (distance === 1) {
            return MGPFallible.success(new TrexoMove(zero, one));
        } else {
            return MGPFallible.failure(TrexoFailure.NON_NEIGHBORING_SPACES());
        }
    }
    private constructor(first: Coord, second: Coord) {
        super(first, second);
    }
    public toString(): string {
        return this.first.toString() + ' && ' + this.second.toString();
    }
    public equals(o: TrexoMove): boolean {
        return this.first.equals(o.first) && this.second.equals(o.second);
    }
}
