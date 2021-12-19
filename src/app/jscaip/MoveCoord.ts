import { Move } from './Move';
import { Coord } from './Coord';

export abstract class MoveCoord extends Move {

    public readonly coord: Coord;

    constructor(x: number, y: number) {
        super();
        this.coord = new Coord(x, y);
    }
}
