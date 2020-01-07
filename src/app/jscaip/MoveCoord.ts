import {Move} from './Move';
import {Coord} from './Coord';

export abstract class MoveCoord extends Move { // TODO: Immutable & Pool

    public readonly coord: Coord;

    constructor(x: number, y: number) {
        super();
        this.coord = new Coord(x, y);
    }

    public equals(obj: any): boolean {
        if (this === obj) {
            return true;
        }
        if (obj === null) {
            return false;
        }
        if (!(obj instanceof MoveCoord)) {
            return false;
        }
        if (this.coord === null) {
            if (obj.coord !== null) {
                return false;
            }
        } else {
            if (!this.coord.equals(obj.coord)) {
                return false;
            }
        }
        return true;
    }

    public toString() {
        return 'MoveCoord [coord = ' + this.coord.toString() + ']';
    }
}