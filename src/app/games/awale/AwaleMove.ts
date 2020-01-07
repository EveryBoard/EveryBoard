import { Comparable } from "src/app/collectionlib/MGPMap";
import { MoveCoord } from "src/app/jscaip/MoveCoord";

export class AwaleMove extends MoveCoord {

    static decode(encodedMove: number): AwaleMove {
        const x = encodedMove % 6;
        const y = (encodedMove - x) / 6;
        return new AwaleMove(x, y);
    }

    public decode(encodedMove: number): AwaleMove {
        return AwaleMove.decode(encodedMove);
    }

    public encode(): number {
        // An awalé move goes on x from o to 5
        // and y from 0 to 1
        // encoded as y*6 + x
        return (this.coord.y * 6) + this.coord.x;
    }
}