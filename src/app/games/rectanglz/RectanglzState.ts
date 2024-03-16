import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';

export class RectanglzState extends GameStateWithTable<PlayerOrNone> {

    public static mapper: (oldState: RectanglzState, newBoard: Table<PlayerOrNone>) => RectanglzState =
        (oldState: RectanglzState, newBoard: Table<PlayerOrNone>) => {
            return new RectanglzState(newBoard, oldState.turn);
        };
}
