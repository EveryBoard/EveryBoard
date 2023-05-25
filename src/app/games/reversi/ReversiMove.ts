import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class ReversiMove extends MoveCoord {

    public static encoder: Encoder<ReversiMove> = MoveCoord.getEncoder(ReversiMove.from);

    public static readonly PASS: ReversiMove = new ReversiMove(-1, -1);

    public static from(coord: Coord): MGPFallible<ReversiMove> {
        return MGPFallible.success(new ReversiMove(coord.x, coord.y));
    }
    public toString(): string {
        return 'ReversiMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
}
