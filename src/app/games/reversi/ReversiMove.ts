import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MoveEncoder } from 'src/app/utils/Encoder';

export class ReversiMove extends MoveCoord {
    public static encoder: MoveEncoder<ReversiMove> =
        MoveCoord.getEncoder((c: Coord) => new ReversiMove(c.x, c.y));

    public static readonly PASS: ReversiMove = new ReversiMove(-1, -1);

    public equals(other: ReversiMove): boolean {
        if (other === this) return true;
        return other.coord.equals(this.coord);
    }
    public toString(): string {
        return 'ReversiMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
}
