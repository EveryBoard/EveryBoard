import { Orthogonale } from "src/app/jscaip/DIRECTION";
import { MoveCoord } from "src/app/jscaip/MoveCoord";

export class QuixoMove extends MoveCoord {

    constructor(x: number, y: number, public readonly direction: Orthogonale) {
        super(x, y);
        if (this.coord.isNotInRange(5, 5)) throw new Error("Invalid coord for QuixoMove: " + this.coord.toString() + " is outside the board.");
        if (x !== 0 && x !== 4 && y !== 0 && y !== 4) throw new Error("Invalid coord for QuixoMove: " + this.coord.toString() + " is not on the edge.");
        if (direction == null) throw new Error("Direction cannot be null.");
        if (x === 0 && direction === Orthogonale.LEFT) throw new Error("Invalid direction: pawn on the left side can't be moved to the left " + this.coord.toString() + ".");
        if (x === 4 && direction === Orthogonale.RIGHT) throw new Error("Invalid direction: pawn on the right side can't be moved to the right " + this.coord.toString() + ".");
        if (y === 0 && direction === Orthogonale.UP) throw new Error("Invalid direction: pawn on the top side can't be moved up " + this.coord.toString() + ".");
        if (y === 4 && direction === Orthogonale.DOWN) throw new Error("Invalid direction: pawn on the bottom side can't be moved down " + this.coord.toString() + ".");
    }
    public toString(): String {
        return "QuixoMove(" + this.coord.x + ", " + this.coord.y + ", " + this.direction.toString() + ")";
    }
    public equals(o: any): boolean {
        if (o === this) return true;
        if (!(o instanceof QuixoMove)) return false;
        const other: QuixoMove = <QuixoMove> o;
        if (!other.coord.equals(this.coord)) return false;
        return other.direction === this.direction;
    }
    public encode(): number {
        const dir: number = this.direction.toInt();
        const y: number = this.coord.y * 4;
        const x: number = this.coord.x * 20;
        return x + y + dir;
    }
    public static decode(encodedMove: number): QuixoMove {
        const direction: Orthogonale = Orthogonale.fromInt(encodedMove % 4);
        encodedMove -= encodedMove % 4; encodedMove /= 4;
        const y: number = encodedMove % 5;
        encodedMove -= encodedMove % 5; encodedMove /= 5;
        return new QuixoMove(encodedMove, y, direction);
    }
    public decode(encodedMove: number): QuixoMove {
        return QuixoMove.decode(encodedMove);
    }
}