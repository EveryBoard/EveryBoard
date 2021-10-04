import { RectangularGameState } from '../../jscaip/RectangularGameState';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class P4State extends RectangularGameState<Player> { // TODO make this special cause P4 use X not (x, y) !!

    public static getInitialState(): P4State {
        const board: Player[][] = ArrayUtils.createTable(7, 6, Player.NONE);
        return new P4State(board, 0);
    }
}
