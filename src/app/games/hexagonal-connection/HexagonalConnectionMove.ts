import { Encoder } from '@everyboard/lib';
import { Coord } from 'src/app/jscaip/Coord';
import { CoordSet } from 'src/app/jscaip/CoordSet';
import { Move } from 'src/app/jscaip/Move';

export class HexagonalConnectionMove extends Move {

    public static of(coords: Coord[]): HexagonalConnectionMove {
        return new HexagonalConnectionMove(new CoordSet(coords));
    }

    public static encoder: Encoder<HexagonalConnectionMove> = Encoder.tuple(
        [Encoder.list(Coord.encoder)],
        (move: HexagonalConnectionMove) => [move.coords.toList()],
        (value: [Coord[]]) => HexagonalConnectionMove.of(value[0]),
    );

    private constructor(public readonly coords: CoordSet) {
        super();
    }

    public override toString(): string {
        return 'HexagonalConnectionMove(' + this.coords.toList().map((coord: Coord) => coord.toString()).join(', ') + ')';
    }

    public override equals(other: HexagonalConnectionMove): boolean {
        return this.coords.equals(other.coords);
    }

}

