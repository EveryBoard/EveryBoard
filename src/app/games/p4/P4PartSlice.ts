import {GamePartSlice} from '../../jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/collectionlib/arrayutils/ArrayUtils';

export class P4PartSlice extends GamePartSlice {

    // statics :

    public static getStartingBoard(): number[][] {
        return ArrayUtils.createBiArray(7, 6, Player.NONE.value);
    }
}