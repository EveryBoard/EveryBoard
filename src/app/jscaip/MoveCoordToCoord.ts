import { MoveCoord } from './MoveCoord';
import { Coord } from './coord/Coord';

export abstract class MoveCoordToCoord extends MoveCoord {
    // non static fields :

    public readonly end: Coord;

    constructor(start: Coord, end: Coord) {
        super(start.x, start.y);
        if (end == null) throw new Error('End cannot be null.');
        if (start.equals(end)) throw new Error('MoveCoordToCoord cannot be static.');
        this.end = end;
    }
}
