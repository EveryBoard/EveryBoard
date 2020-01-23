import { MoveCoordToCoordAndCapture } from "src/app/jscaip/MoveCoordToCoordAndCapture";
import { Coord } from "src/app/jscaip/Coord";

export class TablutMove extends MoveCoordToCoordAndCapture {

    public equals(o: any): boolean {
        if (o === this) return true;
        if (!(o instanceof TablutMove)) return false;
        const other: TablutMove = o as TablutMove;
        if (!other.coord.equals(this.coord)) return false;
        if (!other.end.equals(this.end)) return false;
        return true; // TODO: figure out what to do with captures
    }
    public toString(): String {
        return "TablutMove(" + this.coord + "->" + this.end + ")";
    }

    public decode(encodedMove: number): TablutMove {
        return TablutMove.decode(encodedMove);
    }

    static decode(encodedMove: number): TablutMove {
        // encoded as such : dx; dy; ax; ay
        const ay = encodedMove % 16;
        encodedMove = encodedMove / 16;
        encodedMove -= encodedMove % 1;
        const ax = encodedMove % 16;
        const arrive: Coord = new Coord(ax, ay);
        encodedMove = encodedMove / 16;
        encodedMove -= encodedMove % 1;
        const dy = encodedMove % 16;
        encodedMove = encodedMove / 16;
        encodedMove -= encodedMove % 1;
        const dx = encodedMove % 16;
        const depart: Coord = new Coord(dx, dy);
        return new TablutMove(depart, arrive, []); // TODO: check that there is no need to encode capture
    }

    public encode(): number {
        // encoded as (binarywise) A(x, y) -> B(X, Y)
        // all value are between 0 and 8, so encoded on four bits
        // dxdx dydy axax ayay
        // TODO: verify that there is no need to send the capture 
        const dx: number = this.coord.x;
        const dy: number = this.coord.y;
        const ax: number = this.end.x;
        const ay: number = this.end.y;
        return (dx * 4096) + (dy * 256) + (ax * 16) + ay;
    }
}