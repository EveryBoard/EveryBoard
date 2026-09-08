import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Topology } from '../topology/Topology';

import { GameState } from './GameState';

export abstract class TopologicGameState<P extends NonNullable<unknown>> extends GameState {

    public constructor(
        turn: number,
        private readonly topology: Topology<Direction>,
    ) {
        super(turn);
    }

    public getTopology(): Topology<Direction> {
        return this.topology;
    }

    public abstract getCoordsAndContents(): { coord: Coord; content: P }[];

    public abstract getPieceAt(coord: Coord): P;

    public abstract hasPieceAt(coord: Coord, value: P): boolean;

    public abstract withPieceAt(coord: Coord, value: P): this;

    public abstract isNotOnBoard(coord: Coord): boolean;

    public abstract isOnBoard(coord: Coord): boolean;

    public abstract incrementTurn(): this;

    public abstract getCenters(): Coord[];

    public abstract getAllCoords(): Coord[];
}
