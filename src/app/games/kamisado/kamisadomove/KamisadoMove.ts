import { Coord } from "src/app/jscaip/coord/Coord"
import { MoveCoordToCoord } from "src/app/jscaip/MoveCoordToCoord";
import { Move } from "src/app/jscaip/Move"
import { KamisadoRulesConfig } from "../kamisadorules/KamisadoRulesConfig";
import { Direction } from "src/app/jscaip/DIRECTION";

export class KamisadoMove extends MoveCoordToCoord {
    public static decode(encodedMove: number): KamisadoMove {
        const y2 = encodedMove % 16;
        encodedMove = (encodedMove / 16) - (encodedMove % 1);
        const x2 = encodedMove % 16;
        encodedMove = (encodedMove / 16) - (encodedMove % 1);
        const y1 = encodedMove % 16;
        encodedMove = (encodedMove / 16) - (encodedMove % 1);
        const x1 = encodedMove % 16;
        return new KamisadoMove(new Coord(x1, y1), new Coord(x2, y2));
    }
    public constructor(start: Coord, end: Coord) {
        super(start, end);
        if (!start.isInRange(KamisadoRulesConfig.WIDTH, KamisadoRulesConfig.HEIGHT)) {
            throw new Error("Starting coord of KamisadoMove must be on the board, not at " + start.toString());
        }
        if (!end.isInRange(KamisadoRulesConfig.WIDTH, KamisadoRulesConfig.HEIGHT)) {
            throw new Error("End coord of KamisadoMove must be on the board, not at " + end.toString());
        }
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
        return "KamisadoMove(" + this.coord + "->" + this.end + ")";
    }
    public encode(): number {
        const x1: number = this.coord.x;
        const y1: number = this.coord.y;
        const x2: number = this.end.x;
        const y2: number = this.end.y;
        return (x1 * 4096) + (y1 * 256) + (x2 * 16) + y2;
    }
    public decode(encodedMove: number): KamisadoMove {
        return KamisadoMove.decode(encodedMove);
    }
}