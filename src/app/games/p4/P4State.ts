import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from '../../jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { TableUtils } from 'src/app/utils/ArrayUtils';

export class P4State extends GameStateWithTable<PlayerOrNone> {

    public static readonly WIDTH: number = 7;

    public static readonly HEIGHT: number = 6;

    public static getInitialState(): P4State {
        const board: PlayerOrNone[][] = TableUtils.create(P4State.WIDTH, P4State.HEIGHT, PlayerOrNone.NONE);
        return new P4State(board, 0);
    }
    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(P4State.WIDTH, P4State.HEIGHT);
    }
}
