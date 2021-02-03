import { MoveCoord } from 'src/app/jscaip/MoveCoord';

export class GoMove extends MoveCoord {
    public static readonly PASS: GoMove = new GoMove(-1, 0);

    public static readonly PASS_NUMBER: number = -1;

    public static readonly ACCEPT: GoMove = new GoMove(-2, 0);

    public static readonly ACCEPT_NUMBER: number = -2;

    public static decode(encodedMove: number): GoMove {
        if (encodedMove === GoMove.PASS_NUMBER) {
            return GoMove.PASS;
        }
        const x = encodedMove % 19;
        const y = (encodedMove - x) / 19;
        return new GoMove(x, y);
    }
    public static encode(move: GoMove): number {
        // A go move goes on x from o to 18
        // and y from 0 to 18
        // encoded as y*18 + x
        return (move.coord.y * 19) + move.coord.x;
    }
    public equals(o: GoMove): boolean {
        if (this === o) return true;
        if (o == null) return false;
        return this.coord.equals(o.coord);
    }
    public toString(): string {
        return 'GoMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
    public decode(encodedMove: number): GoMove {
        return GoMove.decode(encodedMove);
    }
    public encode(): number {
        return GoMove.encode(this);
    }
}
