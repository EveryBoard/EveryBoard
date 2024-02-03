import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { TableUtils, Table } from 'src/app/utils/ArrayUtils';

export class ConnectSixState extends GameStateWithTable<PlayerOrNone> {

    public static readonly WIDTH: number = 19;

    public static readonly HEIGHT: number = 19;

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(ConnectSixState.WIDTH, ConnectSixState.HEIGHT);
    }
    public static getInitialState(): ConnectSixState {
        const board: Table<PlayerOrNone> = TableUtils.create(ConnectSixState.WIDTH,
                                                             ConnectSixState.HEIGHT,
                                                             PlayerOrNone.NONE);
        return new ConnectSixState(board, 0);
    }
}
