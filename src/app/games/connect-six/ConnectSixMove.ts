import { MoveEncoder } from 'src/app/utils/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Coord } from 'src/app/jscaip/Coord';
import { ConnectSixState } from './ConnectSixState';
import { Utils } from 'src/app/utils/utils';

export class ConnectSixFirstMove extends MoveCoord {

    public static isInRange(coord: Coord): boolean {
        return coord.isInRange(ConnectSixState.WIDTH, ConnectSixState.WIDTH);
    }
    public static from(coord: Coord): ConnectSixFirstMove {
        Utils.assert(ConnectSixFirstMove.isInRange(coord), 'FIRST_COORD_IS_OUT_OF_RANGE');
        return new ConnectSixFirstMove(coord.x, coord.y);
    }
    public static encoder: MoveEncoder<ConnectSixFirstMove> = MoveCoord.getEncoder(ConnectSixFirstMove.from);

    private constructor(x: number, y: number) {
        super(x, y);
    }

    public equals(other: ConnectSixFirstMove): boolean {
        return this.coord.equals(other.coord);
    }
    public toString(): string {
        return 'ConnectSixFirstMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
}
export class ConnectSixDrops extends MoveWithTwoCoords {

    public static encoder: MoveEncoder<ConnectSixDrops> = MoveWithTwoCoords.getFallibleEncoder(ConnectSixDrops.from);

    public static from(first: Coord, second: Coord): MGPFallible<ConnectSixDrops> {
        Utils.assert(first.isInRange(ConnectSixState.WIDTH, ConnectSixState.WIDTH), 'FIRST_COORD_IS_OUT_OF_RANGE');
        Utils.assert(second.isInRange(ConnectSixState.WIDTH, ConnectSixState.WIDTH), 'SECOND_COORD_IS_OUT_OF_RANGE');
        Utils.assert(first.equals(second) === false, 'COORDS_SHOULD_BE_DIFFERENT');
        return MGPFallible.success(new ConnectSixDrops(first, second));
    }
    public toString(): string {
        return 'ConnectSixDrops(' + this.getFirst().toString() + ', ' + this.getSecond().toString() + ')';
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
