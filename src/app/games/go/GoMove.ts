import { Encoder } from '@everyboard/lib';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Coord } from 'src/app/jscaip/Coord';

export class GoMove extends MoveCoord {

    public static readonly PASS: GoMove = new GoMove(-1, 0);

    public static readonly ACCEPT: GoMove = new GoMove(-2, 0);

    public static encoder: Encoder<GoMove> = MoveCoord.getEncoder(GoMove.of);

    public static of(coord: Coord): GoMove {
        return new GoMove(coord.x, coord.y);
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
