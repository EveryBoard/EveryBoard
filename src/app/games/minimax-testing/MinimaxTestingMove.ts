import { Move } from "src/app/jscaip/Move";

export class MinimaxTestingMove extends Move {

    static readonly RIGHT: MinimaxTestingMove = new MinimaxTestingMove(true);

    static readonly DOWN: MinimaxTestingMove = new MinimaxTestingMove(false);

    public readonly right: boolean;

    private constructor(right: boolean) {
        super();
        this.right = right;
    }

    static decode(encodedMove: number): MinimaxTestingMove {
        return encodedMove == 0 ? MinimaxTestingMove.RIGHT : MinimaxTestingMove.DOWN;
    }

    public decode(encodedMove: number): MinimaxTestingMove {
        return MinimaxTestingMove.decode(encodedMove);
    }

    public encode(): number {
        return this.right ? 0 : 1;
    }

    public equals(obj: any): boolean {
        if (this === obj) {
            return true;
        }
        if (obj === null) {
            return false;
        }
        if (!(obj instanceof MinimaxTestingMove)) {
            return false;
        }
        return this.right === obj.right;
    }

    public toString(): String {
        return this.right ? "Move RIGHT" : "Move DOWN";
    }
}