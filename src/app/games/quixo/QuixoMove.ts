import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Orthogonal';
import { Encoder } from 'src/app/utils/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';

export class QuixoMove extends MoveCoord {

    public static encoder: Encoder<QuixoMove> = Encoder.tuple(
        [Coord.encoder, Orthogonal.encoder],
        (m: QuixoMove): [Coord, Orthogonal] => [m.coord, m.direction],
        (fields: [Coord, Orthogonal]): QuixoMove => new QuixoMove(fields[0].x, fields[0].y, fields[1]));

    public constructor(x: number, y: number, public readonly direction: Orthogonal) {
        super(x, y);
    }
    public toString(): string {
        return 'QuixoMove(' + this.coord.x + ', ' + this.coord.y + ', ' + this.direction.toString() + ')';
    }
    public override equals(other: QuixoMove): boolean {
        if (other === this) return true;
        if (other.coord.equals(this.coord) === false) return false;
        return other.direction === this.direction;
    }
}
