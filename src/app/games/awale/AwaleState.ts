import { GameStateWithTable } from '../../jscaip/GameStateWithTable';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { MancalaConfig } from './AwaleRules';

export class AwaleState extends GameStateWithTable<number> {

    public static getInitialState(config: MancalaConfig): AwaleState {
        const board: number[][] = ArrayUtils.createTable(config.width, 2, config.seed_by_house);
        return new AwaleState(board, 0, [0, 0]);
    }
    public constructor(b: Table<number>, turn: number, public readonly captured: readonly [number, number]) {
        super(b, turn);
    }
    public getCapturedCopy(): [number, number] {
        return [this.captured[0], this.captured[1]];
    }
}
