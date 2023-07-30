import { Encoder } from 'src/app/utils/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { Coord } from 'src/app/jscaip/Coord';
import { ConnectSixState } from './ConnectSixState';
import { Utils } from 'src/app/utils/utils';

export class ConnectSixFirstMove extends MoveCoord {

    public static isInRange(coord: Coord): boolean {
        return coord.isInRange(ConnectSixState.WIDTH, ConnectSixState.HEIGHT);
    }
    public static of(coord: Coord): ConnectSixFirstMove {
        Utils.assert(ConnectSixFirstMove.isInRange(coord), 'FIRST_COORD_IS_OUT_OF_RANGE');
        return new ConnectSixFirstMove(coord.x, coord.y);
    }
    public static encoder: Encoder<ConnectSixFirstMove> = MoveCoord.getEncoder(ConnectSixFirstMove.of);

    private constructor(x: number, y: number) {
        super(x, y);
    }
    public toString(): string {
        return 'ConnectSixFirstMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
}
export class ConnectSixDrops extends MoveWithTwoCoords {

    public static encoder: Encoder<ConnectSixDrops> = MoveWithTwoCoords.getEncoder(ConnectSixDrops.of);

    public static of(first: Coord, second: Coord): ConnectSixDrops {
        Utils.assert(first.isInRange(ConnectSixState.WIDTH, ConnectSixState.HEIGHT), 'FIRST_COORD_IS_OUT_OF_RANGE');
        Utils.assert(second.isInRange(ConnectSixState.WIDTH, ConnectSixState.HEIGHT), 'SECOND_COORD_IS_OUT_OF_RANGE');
        Utils.assert(first.equals(second) === false, 'COORDS_SHOULD_BE_DIFFERENT');
        return new ConnectSixDrops(first, second);
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

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace ConnectSixMove {

    export function isFirstMove(move: ConnectSixMove): move is ConnectSixFirstMove {
        return move instanceof ConnectSixFirstMove;
    }
    export function isDrop(move: ConnectSixMove): move is ConnectSixDrops {
        return move instanceof ConnectSixDrops;
    }
    export const encoder: Encoder<ConnectSixMove> =
        Encoder.disjunction([ConnectSixMove.isFirstMove, ConnectSixMove.isDrop],
                            [ConnectSixFirstMove.encoder, ConnectSixDrops.encoder]);
}
