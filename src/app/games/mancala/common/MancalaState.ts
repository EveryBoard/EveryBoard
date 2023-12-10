import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { ArrayUtils, Table, TableUtils } from 'src/app/utils/ArrayUtils';

export class MancalaState extends GameStateWithTable<number> {

    public constructor(b: Table<number>,
                       turn: number,
                       public readonly scores: readonly [number, number])
    {
        super(b, turn);
    }

    public getScoresCopy(): [number, number] {
        return [this.scores[0], this.scores[1]];
    }

    public equals(other: MancalaState): boolean {
        if (TableUtils.compare(this.board, other.board) === false) return false;
        if (ArrayUtils.equals(this.scores, other.scores) === false) return false;
        return this.turn === other.turn;
    }

    public getCurrentPlayerY(): number {
        return this.getCurrentOpponent().value;
    }

    public getOpponentY(): number {
        return this.getCurrentPlayer().value;
    }

}
