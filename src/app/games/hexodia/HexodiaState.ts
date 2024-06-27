import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Table } from 'src/app/jscaip/TableUtils';
import { GameStateWithTable } from 'src/app/jscaip/state/GameStateWithTable';
import { FourStatePieceGameStateWithTable } from 'src/app/jscaip/state/FourStatePieceGameStateWithTable';

export class HexodiaState extends FourStatePieceGameStateWithTable {

    public static of(oldState: HexodiaState, newBoard: Table<FourStatePiece>): HexodiaState {
        return new HexodiaState(newBoard, oldState.turn);
    }

    public incrementTurn(): HexodiaState {
        return new HexodiaState(this.getCopiedBoard(), this.turn + 1);
    }

    public setPieceAt(coord: Coord, value: FourStatePiece): HexodiaState {
        return GameStateWithTable.setPieceAt(this,
                                             coord,
                                             value,
                                             HexodiaState.of);
    }

}
