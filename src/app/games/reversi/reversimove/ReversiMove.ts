import {MoveCoord} from 'src/app/jscaip/MoveCoord';

export class ReversiMove extends MoveCoord {
    public static readonly PASS: ReversiMove = new ReversiMove(-1, -1);

    public static readonly PASS_NUMBER: number = ReversiMove.PASS.encode();

    public static encode(move: ReversiMove): number {
        return (move.coord.y*8) + move.coord.x;
    }
    public static decode(encodedMove: number): ReversiMove {
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
        return 'ReversiMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
    public encode(): number {
        return ReversiMove.encode(this);
    }
    public decode(encodedMove: number): ReversiMove {
        return ReversiMove.decode(encodedMove);
    }
}
