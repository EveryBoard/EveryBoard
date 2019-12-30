import { MoveCoordAndCapture } from "src/app/jscaip/MoveCoordAndCapture";

export class AwaleMove extends MoveCoordAndCapture<number> {

    static decode(encodedMove: number): AwaleMove {
        const x = encodedMove % 6;
        const y = (encodedMove - x) / 6;
        return new AwaleMove(x, y, []); // TODO: check capture necessity
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