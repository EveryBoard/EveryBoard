import { Encoder, Utils } from '@everyboard/lib';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { Coord } from 'src/app/jscaip/Coord';

export class HexagonalConnectionFirstMove extends MoveCoord {

    public static of(coord: Coord): HexagonalConnectionFirstMove {
        return new HexagonalConnectionFirstMove(coord.x, coord.y);
    }

    public static encoder: Encoder<HexagonalConnectionFirstMove> =
        MoveCoord.getEncoder(HexagonalConnectionFirstMove.of);

    private constructor(x: number, y: number) {
        super(x, y);
    }

    public toString(): string {
        return 'HexagonalConnectionFirstMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }

}

export class HexagonalConnectionDrops extends MoveWithTwoCoords {

    public static encoder: Encoder<HexagonalConnectionDrops> =
        MoveWithTwoCoords.getEncoder(HexagonalConnectionDrops.of);

    public static of(first: Coord, second: Coord): HexagonalConnectionDrops {
        Utils.assert(first.equals(second) === false, 'COORDS_SHOULD_BE_DIFFERENT');
        return new HexagonalConnectionDrops(first, second);
    }

    public toString(): string {
        return 'HexagonalConnectionDrops(' + this.getFirst().toString() + ', ' + this.getSecond().toString() + ')';
    }

    public equals(other: HexagonalConnectionDrops): boolean {
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

// TODO: rename or put in common or refactor in config
export type HexagonalConnectionMove = HexagonalConnectionFirstMove | HexagonalConnectionDrops;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace HexagonalConnectionMove {

    export function isFirstMove(move: HexagonalConnectionMove): move is HexagonalConnectionFirstMove {
        return move instanceof HexagonalConnectionFirstMove;
    }

    export function isDrop(move: HexagonalConnectionMove): move is HexagonalConnectionDrops {
        return move instanceof HexagonalConnectionDrops;
    }

    export const encoder: Encoder<HexagonalConnectionMove> =
        Encoder.disjunction([HexagonalConnectionMove.isFirstMove, HexagonalConnectionMove.isDrop],
                            [HexagonalConnectionFirstMove.encoder, HexagonalConnectionDrops.encoder]);
}
