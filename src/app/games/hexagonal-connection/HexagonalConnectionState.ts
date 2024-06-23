import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Table } from 'src/app/jscaip/TableUtils';
import { GameStateWithTable } from 'src/app/jscaip/state/GameStateWithTable';
import { FourStatePieceGameStateWithTable } from 'src/app/jscaip/state/FourStatePieceGameStateWithTable';

export class HexagonalConnectionState extends FourStatePieceGameStateWithTable {

    public static of(oldState: HexagonalConnectionState, newBoard: Table<FourStatePiece>): HexagonalConnectionState {
        return new HexagonalConnectionState(newBoard, oldState.turn);
    }

    public incrementTurn(): HexagonalConnectionState {
        return new HexagonalConnectionState(this.getCopiedBoard(), this.turn + 1);
    }

    public setPieceAt(coord: Coord, value: FourStatePiece): HexagonalConnectionState {
        return GameStateWithTable.setPieceAt(this,
                                             coord,
                                             value,
                                             HexagonalConnectionState.of);
    }

}
