import { MoveEncoder } from 'src/app/utils/Encoder';
import { MoveCoord, MoveCoordEncoder } from 'src/app/jscaip/MoveCoord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Coord } from 'src/app/jscaip/Coord';
import { ConnectSixState } from './ConnectSixState';
import { ConnectSixFailure } from './ConnectSixFailure';

export class ConnectSixFirstMove extends MoveCoord {

    public static from(coord: Coord): MGPFallible<ConnectSixFirstMove> {
        if (coord.isInRange(ConnectSixState.WIDTH, ConnectSixState.WIDTH)) {
            return MGPFallible.success(new ConnectSixFirstMove(coord.x, coord.y));
        } else {
            return MGPFallible.failure(ConnectSixFailure.FIRST_COORD_IS_OUT_OF_RANGE());
        }
    }
    private constructor(x: number, y: number) {
        super(x, y);
    }
    public static encoder: MoveEncoder<ConnectSixFirstMove> =
        MoveCoordEncoder.getEncoder(ConnectSixState.WIDTH,
                                    ConnectSixState.WIDTH,
                                    (coord: Coord) => ConnectSixFirstMove.from(coord).get());
    public equals(other: ConnectSixFirstMove): boolean {
        return this.coord.equals(other.coord);
    }
    public toString(): string {
        return 'ConnectSixFirstMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
}
export class ConnectSixDrops extends MoveWithTwoCoords {

    public static encoder: MoveEncoder<ConnectSixDrops> = MoveWithTwoCoords.getEncoder(ConnectSixDrops.from);

    public static from(first: Coord, second: Coord): MGPFallible<ConnectSixDrops> {
        if (first.isNotInRange(ConnectSixState.WIDTH, ConnectSixState.WIDTH)) {
            return MGPFallible.failure(ConnectSixFailure.FIRST_COORD_IS_OUT_OF_RANGE());
        } else if (second.isNotInRange(ConnectSixState.WIDTH, ConnectSixState.WIDTH)) {
            return MGPFallible.failure(ConnectSixFailure.SECOND_COORD_IS_OUT_OF_RANGE());
        } else if (first.equals(second)) {
            return MGPFallible.failure(ConnectSixFailure.COORDS_SHOULD_BE_DIFFERENT());
        } else {
            return MGPFallible.success(new ConnectSixDrops(first, second));
        }
    }
    public toString(): string {
        return 'TODOTODO';
    }
    public equals(other: ConnectSixDrops): boolean {
        const thisFirst: Coord = this.getFirst();
        const otherFirst: Coord = other.getFirst();
        const thisSecond: Coord = this.getSecond();
        const otherSecond: Coord = other.getSecond();
        if (thisFirst.equals(otherFirst) && thisSecond.equals(otherSecond)) {
            return true;
        } else if (thisFirst.equals(otherSecond) && thisSecond.equals(otherFirst)) {
            return true;
        } else {
            return false;
        }
    }
}

export type ConnectSixMove = ConnectSixFirstMove | ConnectSixDrops;

export const ConnectSixMoveEncoder: MoveEncoder<ConnectSixMove> =
    MoveEncoder.disjunction(ConnectSixFirstMove.encoder,
                            ConnectSixDrops.encoder,
                            (value: ConnectSixFirstMove): value is ConnectSixFirstMove => {
                                return value instanceof ConnectSixFirstMove;
                            });
