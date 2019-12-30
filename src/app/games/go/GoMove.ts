import { MoveCoordAndCapture } from "src/app/jscaip/MoveCoordAndCapture";
import { Coord } from "src/app/jscaip/Coord";

export class GoMove extends MoveCoordAndCapture<Coord> {

    static readonly pass: GoMove = new GoMove(-1, 1, []);

    static readonly passNumber: number = -1;

    static decode(encodedMove: number): GoMove {
        if (encodedMove === GoMove.passNumber) {
            return GoMove.pass;
        }
        const x = encodedMove % 19; // TODO: vérifier ici le cas où ce sera pas un plateau de taille standard 19x19
        const y = (encodedMove - x) / 19;
        return new GoMove(x, y, []); // check useless []
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