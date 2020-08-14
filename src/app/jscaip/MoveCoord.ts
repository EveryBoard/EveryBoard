import {Move} from './Move';
import {Coord} from './coord/Coord';

export abstract class MoveCoord extends Move { // TODO: Immutable & Pool

    public readonly coord: Coord;

    constructor(x: number, y: number) {
        super();
        this.coord = new Coord(x, y);
    }
}