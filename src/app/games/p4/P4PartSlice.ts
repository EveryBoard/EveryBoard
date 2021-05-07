import { GamePartSlice } from '../../jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class P4PartSlice extends GamePartSlice {
    public static getInitialSlice(): P4PartSlice {
        const board: number[][] = ArrayUtils.createBiArray(7, 6, Player.NONE.value);
        return new P4PartSlice(board, 0);
    }
}
