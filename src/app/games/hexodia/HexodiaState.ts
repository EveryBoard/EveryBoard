import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { Table } from '../../jscaip/TableUtils';
import { FourStatePieceGameStateWithTable } from '../../jscaip/state/FourStatePieceGameStateWithTable';
import { GameStateWithTable } from '../../jscaip/state/GameStateWithTable';

export class HexodiaState extends FourStatePieceGameStateWithTable { // TODO: kill class, it adds nothing ?

    public static override of(oldState: HexodiaState, newBoard: Table<FourStatePiece>): HexodiaState {
        return new HexodiaState(newBoard, oldState.turn);
    }

    public override incrementTurn(): this {
        return new HexodiaState(this.getCopiedBoard(), this.turn + 1) as this;
    }

    public override setPieceAt(coord: Coord, value: FourStatePiece): HexodiaState {
        return GameStateWithTable.setPieceAt(this,
                                             coord,
                                             value,
                                             HexodiaState.of);
    }

}
