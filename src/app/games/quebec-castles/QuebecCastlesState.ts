import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../../../app/jscaip/Coord';
import { Player, PlayerOrNone } from '../../../app/jscaip/Player';
import { PlayerMap } from '../../../app/jscaip/PlayerMap';
import { GameStateWithTable } from '../../../app/jscaip/state/GameStateWithTable';
import { PlayerOrNoneGameStateWithTable } from '../../../app/jscaip/state/PlayerOrNoneGameStateWithTable';
import { Table } from '../../../app/jscaip/TableUtils';

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
