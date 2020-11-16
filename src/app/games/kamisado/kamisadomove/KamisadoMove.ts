import { Coord } from "src/app/jscaip/coord/Coord"
import { MoveCoordToCoord } from "src/app/jscaip/MoveCoordToCoord";
import { KamisadoBoard } from "../KamisadoBoard";

export class KamisadoMove extends MoveCoordToCoord {
    // The PASS move is encoded as a MoveCoordToCoord that is out of the board
    public static PASS: KamisadoMove = new KamisadoMove(new Coord(-1, -1), new Coord(-2, -2));
    public static decode(encodedMove: number): KamisadoMove {
        if (encodedMove < 0) return this.PASS;
        const y2 = encodedMove % 16 - (encodedMove % 1);
        encodedMove = encodedMove / 16
        const x2 = encodedMove % 16 - (encodedMove % 1);
        encodedMove = encodedMove / 16;
        const y1 = encodedMove % 16 - (encodedMove % 1);
        encodedMove = encodedMove / 16;
        const x1 = encodedMove % 16 - (encodedMove % 1);
        return new KamisadoMove(new Coord(x1, y1), new Coord(x2, y2));
    }
    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public static of(start: Coord, end: Coord): KamisadoMove {
        if (start.equals(new Coord(-1, -1)) && end.equals(new Coord(-2, -2))) {
            // Valid move, it is PASS
            return KamisadoMove.PASS;
        }
        if (!start.isInRange(KamisadoBoard.SIZE, KamisadoBoard.SIZE)) {
            throw new Error("Starting coord of KamisadoMove must be on the board, not at " + start.toString());
        }
        if (!end.isInRange(KamisadoBoard.SIZE, KamisadoBoard.SIZE)) {
            throw new Error("End coord of KamisadoMove must be on the board, not at " + end.toString());
        }
        return new KamisadoMove(start, end);
    }
    public equals(o: any): boolean {
        if (o === this) return true;
        if (!(o instanceof KamisadoMove)) return false;
        const other: KamisadoMove = o as KamisadoMove;
        if (!other.coord.equals(this.coord)) return false;
        if (!other.end.equals(this.end)) return false;
        return true;
    }
    public toString(): String {
        if (this === KamisadoMove.PASS) {
            return "KamisadoMove(PASS)";
        }
        return "KamisadoMove(" + this.coord + "->" + this.end + ")";
    }
    public encode(): number {
        const x1: number = this.coord.x;
        const y1: number = this.coord.y;
        const x2: number = this.end.x;
        const y2: number = this.end.y;
        return (x1 * 4096) + (y1 * 256) + (x2 * 16) + y2;
    }
    public static encode(move: KamisadoMove): number {
        return move.encode();
    }
    public decode(encodedMove: number): KamisadoMove {
        return KamisadoMove.decode(encodedMove);
    }
}
