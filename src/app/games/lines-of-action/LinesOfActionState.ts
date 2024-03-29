import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';

export class LinesOfActionState extends GameStateWithTable<PlayerOrNone> {

    public static SIZE: number = 8; // board size

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(LinesOfActionState.SIZE, LinesOfActionState.SIZE);
    }
}
