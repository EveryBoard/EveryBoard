import {GamePartSlice} from '../../jscaip/GamePartSlice';
import { ArrayUtils } from 'src/app/collectionlib/arrayutils/ArrayUtils';

export class AwalePartSlice extends GamePartSlice {

    constructor(b: number[][], turn: number, public captured: ReadonlyArray<number>) {
        super(b, turn);
        if (captured == null) throw new Error("Captured cannot be null");
        if (captured.length !== 2) throw new Error("Captured must be of length 2");
    }
    public static getInitialSlice(): AwalePartSlice {
        const board: number[][] = ArrayUtils.createBiArray(6, 2, 4);
        return new AwalePartSlice(board, 0, [0, 0]);
    }
    public getCapturedCopy(): number[] {
        return [this.captured[0], this.captured[1]];
    }
}