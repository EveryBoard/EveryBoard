import { RectangularGameState } from '../../jscaip/RectangularGameState';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/utils';

export class AwaleState extends RectangularGameState<number> {

    public static getInitialState(): AwaleState {
        const board: number[][] = ArrayUtils.createBiArray(6, 2, 4);
        return new AwaleState(board, 0, [0, 0]);
    }
    constructor(b: number[][], turn: number, public readonly captured: readonly [number, number]) {
        super(b, turn);
        assert(captured != null, 'Captured cannot be null');
    }
    public getCapturedCopy(): [number, number] {
        return [this.captured[0], this.captured[1]];
    }
}
