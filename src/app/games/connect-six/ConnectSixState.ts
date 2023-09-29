import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { GobanConfig } from 'src/app/jscaip/GobanConfig';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';

export class ConnectSixState extends GameStateWithTable<PlayerOrNone> {

    public static getInitialState(config: GobanConfig): ConnectSixState {
        const board: Table<PlayerOrNone> = ArrayUtils.createTable(config.width,
                                                                  config.height,
                                                                  PlayerOrNone.NONE);
        return new ConnectSixState(board, 0);
    }
}
