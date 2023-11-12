import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from '../../jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';

export class P4State extends GameStateWithTable<PlayerOrNone> {

    public static WIDTH: number = 7;

    public static HEIGHT: number = 6;

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(P4State.WIDTH, P4State.HEIGHT);
    }
}
