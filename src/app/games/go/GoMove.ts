import { Encoder } from 'src/app/utils/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class GoMove extends MoveCoord {

    public static readonly PASS: GoMove = new GoMove(-1, 0);

    public static readonly ACCEPT: GoMove = new GoMove(-2, 0);

    public static encoder: Encoder<GoMove> = MoveCoord.getEncoder(GoMove.from);

    public static from(coord: Coord): MGPFallible<GoMove> {
        return MGPFallible.success(new GoMove(coord.x, coord.y));
    }
    public toString(): string {
        if (this === GoMove.PASS) {
            return 'GoMove.PASS';
        } else if (this === GoMove.ACCEPT) {
            return 'GoMove.ACCEPT';
        } else {
            return 'GoMove(' + this.coord.x + ', ' + this.coord.y + ')';
        }
    }
}
