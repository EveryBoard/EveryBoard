import { Coord } from 'src/app/jscaip/Coord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { assert } from 'src/app/utils/assert';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TrexoFailure } from './TrexoFailure';
import { TrexoState } from './TrexoState';

/**
 * It's not really a move coord to coord but rather a "drop two coords" (that are neighbor)
 */
export class TrexoMove extends MoveWithTwoCoords {

    public static encoder: MoveEncoder<TrexoMove> = MoveWithTwoCoords.getFallibleEncoder(TrexoMove.from);

    public static from(zero: Coord, one: Coord): MGPFallible<TrexoMove> {
        assert(zero.isInRange(TrexoState.SIZE, TrexoState.SIZE), `${ zero.toString() } is out of the TrexoBoard!`);
        assert(one.isInRange(TrexoState.SIZE, TrexoState.SIZE), `${ one.toString() } is out of the TrexoBoard!`);
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
    public override toString(): string {
        return this.getFirst().toString() + ' && ' + this.getSecond().toString();
    }
    public equals(other: TrexoMove): boolean {
        return this.getFirst().equals(other.getFirst()) && this.getSecond().equals(other.getSecond());
    }
    public getZero(): Coord {
        return this.getFirst();
    }
    public getOne(): Coord {
        return this.getSecond();
    }
}
