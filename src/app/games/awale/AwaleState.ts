import { GameStateWithTable } from '../../jscaip/GameStateWithTable';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';

export class AwaleState extends GameStateWithTable<number> {

    public static getInitialState(): AwaleState {
        const board: number[][] = ArrayUtils.createTable(6, 2, 4);
        return new AwaleState(board, 0, [0, 0]);
    }
    constructor(b: Table<number>, turn: number, public readonly captured: readonly [number, number]) {
        super(b, turn);
    }
    public getCapturedCopy(): [number, number] {
        return [this.captured[0], this.captured[1]];
    }
}
