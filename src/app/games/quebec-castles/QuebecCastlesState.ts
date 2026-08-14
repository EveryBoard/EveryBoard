import { Player, PlayerOrNone } from '@everyboard/games';
import { PlayerMap } from '@everyboard/games';
import { Coord } from '@everyboard/games';
import { Table } from '@everyboard/games';
import { GameStateWithTable } from '@everyboard/games';
import { PlayerOrNoneGameStateWithTable } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

export class QuebecCastlesState extends PlayerOrNoneGameStateWithTable {

    public static of(oldState: QuebecCastlesState, newBoard: Table<PlayerOrNone>): QuebecCastlesState {
        return new QuebecCastlesState(newBoard, oldState.turn, oldState.castles);
    }

    public constructor(board: Table<PlayerOrNone>,
                       turn: number,
                       public readonly castles: PlayerMap<MGPOptional<Coord>>)
    {
        super(board, turn);
        this.castles.makeImmutable();
    }

    public incrementTurn(): QuebecCastlesState {
        return new QuebecCastlesState(this.getCopiedBoard(), this.turn + 1, this.castles);
    }

    public setPieceAt(coord: Coord, value: PlayerOrNone): QuebecCastlesState {
        return GameStateWithTable.setPieceAt(this,
                                             coord,
                                             value,
                                             QuebecCastlesState.of);
    }

    public isCastleAt(coord: Coord): boolean {
        const castleZero: MGPOptional<Coord> = this.castles.get(Player.ZERO);
        const castleOne: MGPOptional<Coord> = this.castles.get(Player.ONE);
        return castleZero.equalsValue(coord) ||
               castleOne.equalsValue(coord);
    }

}
