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
        this.end = end;
        if (captures == null) throw new Error("Captures cannot be null");
        captures.forEach(c => { if (c == null) throw new Error("A coord of captures cannot be null");});
        this.captures = captures;
    }

    public getCapturesCopy(): Coord[] {
        return GamePartSlice.copyCoordArray(this.captures);
    }
}