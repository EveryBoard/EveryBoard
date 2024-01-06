import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table, TableUtils } from 'src/app/utils/ArrayUtils';

export class MancalaState extends GameStateWithTable<number> {

    public static of(state: MancalaState, board: Table<number>): MancalaState {
        return new MancalaState(board,
                                state.turn,
                                state.getScoresCopy());
    }

    public constructor(b: Table<number>,
                       turn: number,
                       public readonly scores: readonly [number, number])
    {
        super(b, turn);
    }

    public override setPieceAt(coord: Coord, value: number): MancalaState {
        return super.setPieceAt(coord, value, MancalaState.of) as MancalaState;
    }

    public feedStore(player: Player): MancalaState {
        const newScore: [number, number] = this.getScoresCopy();
        newScore[player.value] += 1;
        return new MancalaState(this.getCopiedBoard(),
                                this.turn,
                                newScore);
    }

    public feed(coord: Coord): MancalaState {
        return this.addPieceAt(coord, 1);
    }

    public addPieceAt(coord: Coord, value: number): MancalaState {
        const previousValue: number = this.getPieceAt(coord);
        return this.setPieceAt(coord, previousValue + value);
    }

    public getTotalRemainingSeeds(): number {
        return TableUtils.sum(this.board);
    }

    public getScoresCopy(): [number, number] {
        return [this.scores[0], this.scores[1]];
    }

    /**
     * @param player the player that'll win point
     * @param coord the coord that'll get empty
     * @returns the resulting state in which 'player' emptied 'coord' to win all its seeds as point
     */
    public capture(player: Player, coord: Coord): MancalaState {
        const capturedSeeds: number = this.getPieceAt(coord);
        const newScores: [number, number] = this.getScoresCopy();
        newScores[player.value] += capturedSeeds;
        const result: MancalaState = new MancalaState(this.getCopiedBoard(),
                                                      this.turn,
                                                      newScores);
        return result.setPieceAt(coord, 0);
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
