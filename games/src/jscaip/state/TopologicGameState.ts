import { Coord } from '../Coord';
import { Direction } from '../direction/Direction';
import { TopologicShape } from '../shape/TopologicShape';
import { Topology } from '../topology/Topology';

import { GameState } from './GameState';

export abstract class TopologicGameState<P extends NonNullable<unknown>, D extends Direction> extends GameState {

    public constructor(
        turn: number,
        private readonly topology: Topology<D>,
        private readonly shape: TopologicShape<D>,
    ) {
        super(turn);
    }

    public getTopology(): Topology<D> {
        return this.topology;
    }

    public getShape(): TopologicShape<D> {
        return this.shape;
    }

    public abstract getCoordsAndContents(): { coord: Coord; content: P }[];

    public abstract getPieceAt(coord: Coord): P;

    public abstract hasPieceAt(coord: Coord, value: P): boolean;

    public abstract withPieceAt(coord: Coord, value: P): this;

    public abstract isNotOnBoard(coord: Coord): boolean;

    public abstract isOnBoard(coord: Coord): boolean;

    public abstract incrementTurn(): TopologicGameState<P, D>;

    public abstract getCenters(): Coord[];

    public abstract getAllCoords(): Coord[];
}
