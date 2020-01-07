import {MoveCoord} from './MoveCoord';
import {Coord} from './Coord';
import { GamePartSlice } from './GamePartSlice';

export abstract class MoveCoordToCoordAndCapture extends MoveCoord {

    // non static fields :

    public readonly end: Coord;

    private captures: Coord[];

    constructor(start: Coord, end: Coord, captures: Coord[]) {
        super(start.x, start.y);
        if (end == null) throw new Error("End cannot be null");
        if (captures == null) throw new Error("Captures cannot be null");
        captures.forEach(c => { if (c == null) throw new Error("A coord of captures cannot be null");});
        this.end = end;
        this.captures = captures;
    }

    getCapturesCopy(): Coord[] {
        return GamePartSlice.copyCoordArray(this.captures);
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