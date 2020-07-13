import { MoveCoordToCoord } from "src/app/jscaip/MoveCoordToCoord";
import { Coord } from "src/app/jscaip/Coord";
import { SaharaPartSlice } from "../SaharaPartSlice";
import { TriangularCheckerBoard } from "src/app/jscaip/TriangularCheckerboard";

export class SaharaMove extends MoveCoordToCoord {

    public static encode(move: SaharaMove): number {
        return move.encode();
    }
    public static decode(encodedMove: number): SaharaMove {
        const ey: number = encodedMove%6;
        encodedMove -= ey;
        encodedMove /= 6;
        const ex: number = encodedMove%11;
        encodedMove -= ex;
        encodedMove /=11;
        const sy: number = encodedMove%6;
        encodedMove -= sy;
        encodedMove /= 6;
        const sx: number = encodedMove;
        return new SaharaMove(new Coord(sx, sy), new Coord(ex, ey));
    }
    public static checkDistanceAndLocation(start: Coord, end: Coord) {
        const dx: number = Math.abs(start.x - end.x);
        const dy: number = Math.abs(start.y - end.y);
        const distance: number = dx+dy;
        if (distance === 0) {
            throw new Error("Move cannot be static");
        } else if (distance === 1) {
            const fakeNeighboors: Coord = TriangularCheckerBoard.getFakeNeighboors(start);
            if (end.equals(fakeNeighboors)) throw new Error(start.toString() + " and " + end.toString() + " are not neighboors");
        } else if (distance === 2) {
            if ((start.x + start.y)%2 === 0) throw new Error("Can only bounce twice when started on a white triangle");
            if (start.x === end.x) throw new Error(start.toString() + " and " + end.toString() + " have no intermediary neighboors");
        } else {
            throw new Error("Maximal |x| + |y| distance for SaharaMove is 2, got " + distance);
        }
    }
    constructor(start: Coord, end: Coord) {
        super(start, end);
        if (!start.isInRange(SaharaPartSlice.WIDTH, SaharaPartSlice.HEIGHT))
            throw new Error("Move must start inside the board not at "+start.toString());
        if (!end.isInRange(SaharaPartSlice.WIDTH, SaharaPartSlice.HEIGHT))
            throw new Error("Move must end inside the board not at "+end.toString());
        SaharaMove.checkDistanceAndLocation(start, end);
    }
    public equals(o: any): boolean {
        if (o === this) return true;
        if (!(o instanceof SaharaMove)) return false;
        const other: SaharaMove = o as SaharaMove;
        if (!other.coord.equals(this.coord)) return false;
        if (!other.end.equals(this.end)) return false;
        return true;
    }
    public toString(): String {
        return "SaharaMove(" + this.coord + "->" + this.end + ")";
    }
    public encode(): number {
        const ey: number = this.end.y;
        const ex: number = this.end.x;
        const sy: number = this.coord.y;
        const sx: number = this.coord.x;
        return (6*11*6*sx) + (11*6*sy) + (6*ex) + ey;
    }
    public decode(encodedMove: number): SaharaMove {
        return SaharaMove.decode(encodedMove);
    }
}