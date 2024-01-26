import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { Table, TableUtils } from 'src/app/utils/ArrayUtils';

export class MancalaState extends GameStateWithTable<number> {

    public constructor(b: Table<number>,
                       turn: number,
                       public readonly scores: PlayerNumberMap)
    {
        super(b, turn);
    }

    public getScoresCopy(): PlayerNumberMap {
        return this.scores.getCopy();
    }

    public equals(other: MancalaState): boolean {
        if (TableUtils.compare(this.board, other.board) === false) return false;
        if (this.scores.equals(other.scores) === false) return false;
        return this.turn === other.turn;
    }

    public getCurrentPlayerY(): number {
        return this.getCurrentOpponent().getValue();
    }

    public getOpponentY(): number {
        return this.getCurrentPlayer().getValue();
    }

}
