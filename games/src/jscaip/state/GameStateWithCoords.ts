import { Coord } from '../Coord';

import { GameState } from './GameState';

export abstract class GameStateWithCoords<P extends NonNullable<unknown>> extends GameState {

    public abstract getPieceAt(coord: Coord): P;

    public abstract isOnBoard(coord: Coord): boolean;

    public abstract getCoordsAndContents(): {coord: Coord; content: P}[];

}
