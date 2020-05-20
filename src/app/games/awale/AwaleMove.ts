import { MoveCoord } from "src/app/jscaip/MoveCoord";

export class AwaleMove extends MoveCoord {

    public equals(o: any): boolean {
        if (o === this) return true;
        if (!(o instanceof AwaleMove)) return false;
        const other: AwaleMove = o as AwaleMove;
        if (!other.coord.equals(this.coord)) return false;
        return true;
    }
    public toString(): String {
        return "AwaleMove(" + this.coord.x + ", " + this.coord.y + ")";
    }
    public static decode(encodedMove: number): AwaleMove {
        const x = encodedMove % 6;
        const y = (encodedMove - x) / 6;
        return new AwaleMove(x, y);
    }
    public static encode(move: AwaleMove): number {
        return move.encode();
    }
    public decode(encodedMove: number): AwaleMove {
        return AwaleMove.decode(encodedMove);
    }
    public encode(): number {
        // An awal� move goes on x from o to 5
        // and y from 0 to 1
        // encoded as y*6 + x
        return (this.coord.y * 6) + this.coord.x;
    }
}