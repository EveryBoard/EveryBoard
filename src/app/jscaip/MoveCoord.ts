import { Move } from './Move';
import { Coord } from './Coord';
import { MoveEncoder } from '../utils/Encoder';

export abstract class MoveCoord extends Move {

    public static getEncoder<T extends MoveCoord>(generate: (coord: Coord) => T)
    : MoveEncoder<T>
    {
        return MoveEncoder.tuple(
            [Coord.encoder],
            (m: T): [Coord] => [m.coord],
            (fields: [Coord]): T => generate(fields[0]));
    }

    public readonly coord: Coord;

    public constructor(x: number, y: number) {
        super();
        this.coord = new Coord(x, y);
    }
}
