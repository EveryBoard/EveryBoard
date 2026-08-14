
import { Coord } from '@everyboard/games';
import { CoordSet } from '@everyboard/games';
import { Move } from '@everyboard/games';
import { Encoder } from '@everyboard/lib';

export class HexodiaMove extends Move {

    public static of(coords: Coord[]): HexodiaMove {
        return new HexodiaMove(new CoordSet(coords));
    }

    public static encoder: Encoder<HexodiaMove> = Encoder.tuple(
        [Encoder.list(Coord.encoder)],
        (move: HexodiaMove) => [move.coords.toList()],
        (value: [Coord[]]) => HexodiaMove.of(value[0]),
    );

    private constructor(public readonly coords: CoordSet) {
        super();
    }

    public override toString(): string {
        return 'HexodiaMove(' + this.coords.toList().map((coord: Coord) => coord.toString()).join(', ') + ')';
    }

    public override equals(other: HexodiaMove): boolean {
        return this.coords.equals(other.coords);
    }

}
