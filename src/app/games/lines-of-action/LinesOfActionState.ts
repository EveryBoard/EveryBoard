import { Coord } from '../../jscaip/Coord';
import { PlayerOrNoneGameStateWithTable } from '../../jscaip/state/PlayerOrNoneGameStateWithTable';

export class LinesOfActionState extends PlayerOrNoneGameStateWithTable {

    public static SIZE: number = 8; // board size

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(LinesOfActionState.SIZE, LinesOfActionState.SIZE);
    }
}
