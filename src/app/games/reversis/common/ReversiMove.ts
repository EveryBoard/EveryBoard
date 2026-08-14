
import { Coord } from '@everyboard/games';
import { MoveCoord } from '@everyboard/games';
import { Encoder } from '@everyboard/lib';

export class ReversiMove extends MoveCoord {

    public static encoder: Encoder<ReversiMove> = MoveCoord.getEncoder(ReversiMove.of);

    public static readonly PASS: ReversiMove = new ReversiMove(-1, -1);

    public static of(coord: Coord): ReversiMove {
        return new ReversiMove(coord.x, coord.y);
    }
    public toString(): string {
        return 'ReversiMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
}
