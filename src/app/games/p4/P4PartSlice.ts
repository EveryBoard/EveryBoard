import { GamePartSlice } from '../../jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/collectionlib/arrayutils/ArrayUtils';

export class P4PartSlice extends GamePartSlice {

    // Statics :

    public static getStartingBoard(): number[][] {
        return ArrayUtils.createBiArray(7, 6, Player.NONE.value);
    }
    public static getInitialSlice(): P4PartSlice {
        const board: number[][] = P4PartSlice.getStartingBoard();
        return new P4PartSlice(board, 0);
    }
}