import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export type TeekoMove = TeekoDropMove | TeekoTranslateMove;

export class TeekoDropMove extends MoveCoord {

    public static encoder: MoveEncoder<TeekoDropMove> = MoveCoord.getFallibleEncoder(TeekoDropMove.from);

    public static from(coord: Coord): MGPFallible<TeekoDropMove> {
        if (TeekoMove.isInRange(coord)) {
            return MGPFallible.success(new TeekoDropMove(coord.x, coord.y));
        } else {
            return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(coord));
        }
    }
    public override toString(): string {
        return 'TeekoMove' + this.coord.toString();
    }
    public override equals(other: TeekoMove): boolean {
        if (other instanceof TeekoDropMove) {
            return super.equals(other as this);
        } else {
            return false;
        }
    }
}

export class TeekoTranslateMove extends MoveCoordToCoord {

    public static encoder: MoveEncoder<TeekoTranslateMove> =
        MoveCoordToCoord.getFallibleEncoder(TeekoTranslateMove.from);

    public static from(start: Coord, end: Coord): MGPFallible<TeekoTranslateMove> {
        if (TeekoMove.isInRange(start) === false) {
            return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(start));
        } else if (TeekoMove.isInRange(end) === false) {
            return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(end));
        } else if (start.equals(end)) {
            return MGPFallible.failure(RulesFailure.MOVE_CANNOT_BE_STATIC());
        } else {
            return MGPFallible.success(new TeekoTranslateMove(start, end));
        }
    }
    public override toString(): string {
        return 'TeekoMove(' + this.getStart().toString() + ' -> ' + this.getEnd().toString() + ')';
    }
    public override equals(other: TeekoMove): boolean {
        if (other instanceof TeekoTranslateMove) {
            return this.getStart().equals(other.getStart()) &&
                   this.getEnd().equals(other.getEnd()); // TODO: refactor after move-reuse-tuple
        } else {
            return false;
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace TeekoMove {

    export function isInRange(coord: Coord): boolean {
        return coord.isInRange(5, 5);
    }
    export const encoder: MoveEncoder<TeekoMove> =
        MoveEncoder.disjunction(TeekoDropMove.encoder,
                                TeekoTranslateMove.encoder,
                                (move: TeekoMove): move is TeekoDropMove => move instanceof TeekoDropMove);
}
