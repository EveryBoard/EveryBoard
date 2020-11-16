import { Coord } from "src/app/jscaip/coord/Coord";
import { MoveCoordToCoord } from "src/app/jscaip/MoveCoordToCoord";
import { DvonnBoard } from "../DvonnBoard";

export class DvonnMove extends MoveCoordToCoord {
    public static PASS: DvonnMove = new DvonnMove(new Coord(-1, -1), new Coord(-2, -2));
    public static decode(encodedMove: number): DvonnMove {
        if (encodedMove < 0) return this.PASS;
        const y2 = encodedMove % 16 - (encodedMove % 1);
        encodedMove = encodedMove / 16
        const x2 = encodedMove % 16 - (encodedMove % 1);
        encodedMove = encodedMove / 16;
        const y1 = encodedMove % 16 - (encodedMove % 1);
        encodedMove = encodedMove / 16;
        const x1 = encodedMove % 16 - (encodedMove % 1);
        return new DvonnMove(new Coord(x1, y1), new Coord(x2, y2));
    }
    public static encode(move: DvonnMove): number {
        return move.encode();
    }
    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public static of(start: Coord, end: Coord) {
        if (start.x === -1 && start.y === -1 && end.x === -2 && end.y === -2) {
            // PASS move
            return DvonnMove.PASS;
        }
        // Move should be on board
        if (!DvonnBoard.isOnBoard(start)) {
            throw new Error("Starting coord of DvonnMove must be on the board, not at " + start.toString());
        }
        if (!DvonnBoard.isOnBoard(end)) {
            throw new Error("End coord of DvonnMove must be on the board, not at " + start.toString());
        }
        // Move should be a straight line
        if (start.y === end.y) {
            // vertical move, allowed
            return new DvonnMove(start, end);
        } else if (start.x === end.x) {
            // horizontal move, allowed
            return new DvonnMove(start, end);
        } else if (start.x + start.y == end.x + end.y) {
            // diagonal move, allowed
            return new DvonnMove(start, end);
        } else {
            throw new Error("Invalid move");
        }
    }
    public toString(): String {
        if (this === DvonnMove.PASS) {
            return "DvonnMove(PASS)";
        }
        return "DvonnMove(" + this.coord + "->" + this.end + ")";
    }
    public length(): number {
        if (this.coord.y === this.end.y) {
            return Math.abs(this.coord.x - this.end.x);
        } else if (this.coord.x === this.end.x) {
            return Math.abs(this.coord.y - this.end.y);
        } else {
            return Math.abs(this.coord.y - this.end.y);
        }
    }
    public encode(): number {
        const x1: number = this.coord.x;
        const y1: number = this.coord.y;
        const x2: number = this.end.x;
        const y2: number = this.end.y;
        return (x1 * 4096) + (y1 * 256) + (x2 * 16) + y2;
    }
    public decode(encodedMove: number): DvonnMove {
        return DvonnMove.decode(encodedMove);
    }
    public equals(o: any): boolean {
        if (o === this) return true;
        if (!(o instanceof DvonnMove)) return false;
        const other: DvonnMove = o as DvonnMove;
        if (!other.coord.equals(this.coord)) return false;
        if (!other.end.equals(this.end)) return false;
        return true;
    }
}
