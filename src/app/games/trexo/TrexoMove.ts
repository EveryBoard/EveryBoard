import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { NumberEncoder } from 'src/app/utils/Encoder';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TrexoState } from './TrexoState';

export class TrexoMoveFailure {

    public static readonly NON_NEIGHBOR_COORDS: Localized = () => $localize`Thoses two coord are not neighbors!`;
}

/**
 * It's not really a move coord to coord but rather a "drop two coords" (that are neighbor)
 */
export class TrexoMove extends MoveCoordToCoord {

    public static encoder: NumberEncoder<TrexoMove> =
        MoveCoordToCoord.getEncoder<TrexoMove>(TrexoState.SIZE, TrexoState.SIZE,
                                               (zero: Coord, one: Coord): TrexoMove => {
                                                   return TrexoMove.from(zero, one).get();
                                               });

    public static from(zero: Coord, one: Coord): MGPFallible<TrexoMove> {
        if (zero.isNotInRange(TrexoState.SIZE, TrexoState.SIZE) ||
            one.isNotInRange(TrexoState.SIZE, TrexoState.SIZE))
        {
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
        super(zero, one);
    }
    public toString(): string {
        return this.coord.toString() + ' && ' + this.end.toString();
    }
    public equals(o: TrexoMove): boolean {
        return this.coord.equals(o.coord) && this.end.equals(o.end);
    }
}
