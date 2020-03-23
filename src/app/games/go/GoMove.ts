import { MoveCoordAndCapture } from "src/app/jscaip/MoveCoordAndCapture";
import { Coord } from "src/app/jscaip/Coord";
import { MoveCoord } from "src/app/jscaip/MoveCoord";

export class GoMove extends MoveCoord {

    static readonly pass: GoMove = new GoMove(-1, 1);

    static readonly passNumber: number = -1;

    static decode(encodedMove: number): GoMove {
        if (encodedMove === GoMove.passNumber) {
            return GoMove.pass;
        }
        const x = encodedMove % 19;
        const y = (encodedMove - x) / 19;
        return new GoMove(x, y);
    }

    public equals(o: any): boolean {
        if (this === o) return true;
        if (o == null) return false;
        if (!this.coord.equals(o.coord)) return false;
        return true;
    }

    public toString(): String {
        return "GoMove(" + this.coord.x + ", " + this.coord.y + ")";
    }

    public decode(encodedMove: number): GoMove {
        return GoMove.decode(encodedMove);
    }

    public encode(): number {
        // A go move goes on x from o to 18
        // and y from 0 to 18
        // encoded as y*18 + x
        if (this.equals(GoMove.pass)) {
            return GoMove.passNumber;
        }
        return (this.coord.y * 19) + this.coord.x;
    }
}