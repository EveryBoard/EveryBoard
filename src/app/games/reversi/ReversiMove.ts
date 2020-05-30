import { MoveCoord } from "src/app/jscaip/MoveCoord";

export class ReversiMove extends MoveCoord {

    static readonly pass: ReversiMove = new ReversiMove(-1, 1); // TODO: make correctly encodable, with same rules

    static readonly passNumber: number = -1;

    public static decode(encodedMove: number): ReversiMove {
        if (encodedMove === ReversiMove.passNumber) {
            return ReversiMove.pass;
        }
        const x = encodedMove % 8; // TODO: vérifier ici le cas où ce sera pas un plateau de taille standard 8x8
        const y = (encodedMove - x) / 8;
        return new ReversiMove(x, y);
    }
    public equals(o: any): boolean {
        if (o === this) return true;
        if (!(o instanceof ReversiMove)) return false;
        const other: ReversiMove = o as ReversiMove;
        return other.coord.equals(this.coord);
    }
    public toString(): String {
        return "ReversiMove(" + this.coord.x + ", " + this.coord.y + ")";
    }
    public decode(encodedMove: number): ReversiMove {
        return ReversiMove.decode(encodedMove);
    }
    public encode(): number {
        return (this.coord.y*8) + this.coord.x;
    }
}