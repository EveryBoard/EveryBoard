import { Coord } from 'src/app/jscaip/Coord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { Encoder, MGPFallible, Utils } from '@everyboard/lib';
import { TrexoFailure } from './TrexoFailure';
import { TrexoState } from './TrexoState';

/**
 * It's not really a move coord to coord but rather a "drop two coords" (that are neighbor)
 */
export class TrexoMove extends MoveWithTwoCoords {

    public static encoder: Encoder<TrexoMove> = MoveWithTwoCoords.getFallibleEncoder(TrexoMove.from);

    public static from(zero: Coord, one: Coord): MGPFallible<TrexoMove> {
        Utils.assert(TrexoState.isOnBoard(zero), `${ zero.toString() } is out of the TrexoBoard!`);
        Utils.assert(TrexoState.isOnBoard(one), `${ one.toString() } is out of the TrexoBoard!`);
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
