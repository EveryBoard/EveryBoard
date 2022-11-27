import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class TrexoMoveFailure {

    public static readonly NON_NEIGHBOR_COORDS: Localized = () => $localize`TODOTODO: NON_NEIGHBOR_COORDS`;
}

export class TrexoMove extends Move {
    public static from(zero: Coord, one: Coord): MGPFallible<TrexoMove> {
        if (zero.isNotInRange(10, 10) || one.isNotInRange(10, 10)) {
            return MGPFallible.failure('TODOTODO OUT OF RANGE FROM Lasca');
        }
        const distance: number = zero.getOrthogonalDistance(one);
        if (distance === 1) {
            return MGPFallible.success(new TrexoMove(zero, one));
        } else {
            return MGPFallible.failure(TrexoMoveFailure.NON_NEIGHBOR_COORDS());
        }
    }
    private constructor(public readonly zero: Coord, public readonly one: Coord) {
        super();
    }
    public toString(): string {
        throw new Error('toString not implemented.');
    }
    public equals(o: this): boolean {
        throw new Error('equals not implemented.');
    }
}
