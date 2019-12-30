import {MoveCoord} from './MoveCoord';
import {Coord} from './Coord';

export abstract class MoveCoordToCoordAndCapture extends MoveCoord {

    // non static fields :

    public readonly end: Coord;

    private captures: Coord[];

    constructor(start: Coord, end: Coord, captures: Coord[]) {
        super(start.x, start.y);
        this.end = end;
        this.captures = captures;
    }

    getCapturesCopy(i: number): Coord { // TODO: homogeneous copy-getters-name
        return this.captures[i];
    }

    toString() {
        return 'MC->C&C [coord = ' + this.coord.toString() + ' to ' + this.end.toString() + ']';
    }

    equals(obj: any): boolean {
        if (this === obj) {
            return true;
        }
        if (obj === null) {
            return false;
        }
        if (!(obj instanceof MoveCoordToCoordAndCapture)) {
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
        if (this.end === null) {
            if (obj.end !== null) {
                return false;
            }
        } else {
            if (!this.end.equals(obj.end)) {
                return false;
            }
        }
        return true;
    }
}