import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';

export class TeekoState extends GameStateWithTable<PlayerOrNone> {

    public static getInitialState(): TeekoState {
        const board: Table<PlayerOrNone> = ArrayUtils.createTable(5, 5, PlayerOrNone.NONE);
        return new TeekoState(board, 0);
    }
}
