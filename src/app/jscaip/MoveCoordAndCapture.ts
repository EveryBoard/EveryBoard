import {MoveCoord} from './MoveCoord';
import { GamePartSlice } from './GamePartSlice';
import { Comparable } from '../collectionlib/MGPMap';

export abstract class MoveCoordAndCapture<C extends Comparable> extends MoveCoord {
    /* is a MoveXY with added captures results
     * the captures result help to retrieve in reverse order
     * if XY cannot help you to reconstruct the part
     */

    protected readonly captures: C[] ;

    constructor(x: number, y: number, captures: C[]) {
        super(x, y);
        this.captures = captures;
    }

    public getCapturesCopy(): C[] {
         return this.captures.map(x => Object.assign({}, x));
    }

    public equals(obj: any): boolean {
        if (this === obj) return true;
        if (obj == null) return false;
        if (!(obj instanceof MoveCoordAndCapture)) return false;
        if (!this.coord.equals(obj.coord)) return false;
        if (this.captures.length !== obj.captures.length) return false;
        for (let i = 0; i < this.captures.length; i++) {
            if (!this.captures[i].equals(obj.captures[i])) return false;
        }
        return true;
    }

    /*public String toString() {
        return "MoveXYC [capture=" + Arrays.toString(capture) + ", y=" + y + ", x=" + x + "]";
        }
        */
}