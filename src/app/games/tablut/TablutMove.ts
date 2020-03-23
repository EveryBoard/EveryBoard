import { Coord } from "src/app/jscaip/Coord";
import { MoveCoordToCoord } from "src/app/jscaip/MoveCoordToCoord";

export class TablutMove extends MoveCoordToCoord {

    public equals(o: any): boolean {
        if (o === this) return true;
        if (!(o instanceof TablutMove)) return false;
        const other: TablutMove = o as TablutMove;
        if (!other.coord.equals(this.coord)) return false;
        if (!other.end.equals(this.end)) return false;
        return true;
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
        return new TablutMove(depart, arrive);
    }
    public encode(): number {
        // encoded as (binarywise) A(x, y) -> B(X, Y)
        // all value are between 0 and 8, so encoded on four bits
        // dxdx dydy axax ayay
        const dx: number = this.coord.x;
        const dy: number = this.coord.y;
        const ax: number = this.end.x;
        const ay: number = this.end.y;
        return (dx * 4096) + (dy * 256) + (ax * 16) + ay;
    }
}