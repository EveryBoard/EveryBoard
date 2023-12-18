import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';
import { Table, TableUtils } from 'src/app/utils/ArrayUtils';

export class MancalaState extends GameStateWithTable<number> {

    public static readonly WIDTH: number = 6;

    public constructor(b: Table<number>, turn: number, public readonly scores: PlayerMap<number>) {
        super(b, turn);
    }

    public getScoresCopy(): PlayerMap<number> {
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
