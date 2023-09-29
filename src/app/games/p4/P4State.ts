import { GameStateWithTable } from '../../jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { P4Config } from './P4Rules';

export class P4State extends GameStateWithTable<PlayerOrNone> {

    public static getInitialState(config: P4Config): P4State {
        const board: PlayerOrNone[][] = ArrayUtils.createTable(config.width, config.height, PlayerOrNone.NONE);
        return new P4State(board, 0);
    }
}
