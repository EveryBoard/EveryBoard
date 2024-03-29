import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';

export class TeekoState extends GameStateWithTable<PlayerOrNone> {

    public static readonly WIDTH: number = 5;

    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(TeekoState.WIDTH, TeekoState.WIDTH);
    }

    public isInDropPhase(): boolean {
        return this.turn < 8;
    }
}
