import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';

export class TeekoState extends GameStateWithTable<PlayerOrNone> {

    public static readonly WIDTH: number = 5;

    public static getInitialState(): TeekoState {
        const board: Table<PlayerOrNone> =
            ArrayUtils.createTable(TeekoState.WIDTH, TeekoState.WIDTH, PlayerOrNone.NONE);
        return new TeekoState(board, 0);
    }
    public isInDropPhase(): boolean {
        return this.turn < 8;
    }
}
