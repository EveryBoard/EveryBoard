import { GamePartSlice } from '../../jscaip/GamePartSlice';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/utils';

export class AwalePartSlice extends GamePartSlice {
    constructor(b: number[][], turn: number, public readonly captured: readonly [number, number]) {
        super(b, turn);
        assert(captured != null, 'Captured cannot be null');
    }
    public static getInitialSlice(): AwalePartSlice {
        const board: number[][] = ArrayUtils.createBiArray(6, 2, 4);
        return new AwalePartSlice(board, 0, [0, 0]);
    }
    public getCapturedCopy(): [number, number] {
        return [this.captured[0], this.captured[1]];
    }
}
