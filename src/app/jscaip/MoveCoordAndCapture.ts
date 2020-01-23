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
}