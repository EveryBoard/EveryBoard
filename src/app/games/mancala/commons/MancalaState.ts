import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { MancalaConfig } from './MancalaConfig';

export class MancalaState extends GameStateWithTable<number> {

    public static readonly WIDTH: number = 6;

    public static getInitialState(config: MancalaConfig): MancalaState {
        const board: number[][] = ArrayUtils.createTable(config.width, 2, config.seedByHouse);
        return new MancalaState(board, 0, [0, 0]);
    }
    public constructor(b: Table<number>, turn: number, public readonly scores: readonly [number, number]) {
        super(b, turn);
    }
    public getScoresCopy(): [number, number] {
        return [this.scores[0], this.scores[1]];
    }
    public equals(other: MancalaState): boolean {
        if (ArrayUtils.compareTable(this.board, other.board) === false) return false;
        if (ArrayUtils.compareArray(this.scores, other.scores) === false) return false;
        return this.turn === other.turn;
    }
    public getCurrentPlayerY(): number {
        return this.getCurrentOpponent().value;
    }
    public getOpponentY(): number {
        return this.getCurrentPlayer().value;
    }
}
