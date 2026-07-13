import { Coord } from './Coord';
import { GameState } from './state/GameState';

import { Topology } from './Topology';

export abstract class TopologicGameState<P extends NonNullable<unknown>> extends GameState {
    public constructor(turn: number,
                       public readonly topology: Topology,
    ) {
        super(turn);
    }

    public getTopology(): Topology {
        return this.topology;
    }

    public abstract getPieceAt(coord: Coord): P;

    public abstract hasPieceAt(coord: Coord, value: P): boolean;

    public abstract setPieceAt(coord: Coord, value: P): this;

    public abstract isNotOnBoard(coord: Coord): boolean;

    public abstract incrementTurn(): this;

}
