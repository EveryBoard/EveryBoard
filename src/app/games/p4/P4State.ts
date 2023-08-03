import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from '../../jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class P4State extends GameStateWithTable<PlayerOrNone> {

    public static getInitialState(): P4State {
        const board: PlayerOrNone[][] = ArrayUtils.createTable(7, 6, PlayerOrNone.NONE);
        return new P4State(board, 0);
    }
    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(7, 6);
    }
}
