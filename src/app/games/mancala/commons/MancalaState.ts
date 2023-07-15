import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';

export class MancalaState extends GameStateWithTable<number> {

    public static getInitialState(): MancalaState {
        const board: number[][] = ArrayUtils.createTable(6, 2, 4);
        return new MancalaState(board, 0, [0, 0]);
    }
    public constructor(b: Table<number>, turn: number, public readonly captured: readonly [number, number]) {
        super(b, turn);
    }
    public getCapturedCopy(): [number, number] {
        return [this.captured[0], this.captured[1]];
    }
}
