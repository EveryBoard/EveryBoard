import { Coord } from './Coord';
import { GameState } from './state/GameState';
import { Topology } from './topology/Topology';

export abstract class TopologicGameState<P extends NonNullable<unknown>> extends GameState {

    public constructor(
        turn: number,
        public readonly topology: Topology,
    ) {
        super(turn);
    }

    public getTopology(): Topology {
        return this.topology;
    }

    public abstract getCoordsAndContents(): { coord: Coord, content: P }[];

    public abstract getPieceAt(coord: Coord): P;

    public abstract hasPieceAt(coord: Coord, value: P): boolean;

    public abstract setPieceAt(coord: Coord, value: P): this;

    public abstract isNotOnBoard(coord: Coord): boolean;

    public abstract incrementTurn(): this;

    public abstract getCenters(): Coord[];

    public abstract getAllCoords(): Coord[];
}
