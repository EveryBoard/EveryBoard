import { Coord } from '../Coord';
import { Shape } from '../shape/Shape';
import { Topology } from '../topology/Topology';

import { SimpleGameStateWithTable } from './SimpleGameStateWithTable';
import { TopologicGameState } from './TopologicGameState';

export class TopologicGameStateWithTable<P extends NonNullable<unknown>> extends TopologicGameState<P> {

    public constructor(
        topology: Topology,
        private readonly shape: Shape,
        private readonly gameStateWithTable: SimpleGameStateWithTable<P>,
    ) {
        super(gameStateWithTable.turn, topology);
    }

    public override getCoordsAndContents(): { coord: Coord, content: P }[] {
        return this.gameStateWithTable.getCoordsAndContents();
    }

    public getPieceAt(coord: Coord): P {
        return this.gameStateWithTable.getPieceAt(coord);
    }

    public hasPieceAt(coord: Coord, value: P): boolean {
        return this.gameStateWithTable.hasPieceAt(coord, value);
    }

    public isOnBoard(coord: Coord): boolean {
        return this.gameStateWithTable.isOnBoard(coord);
    }

    public isNotOnBoard(coord: Coord): boolean {
        return this.gameStateWithTable.isNotOnBoard(coord);
    }

    public override incrementTurn(): this {
        return new TopologicGameStateWithTable(
            this.topology,
            this.shape,
            this.gameStateWithTable.incrementTurn(),
        ) as this;
    }

    public setPieceAt(coord: Coord, value: P): this {
        return new TopologicGameStateWithTable(
            this.topology,
            this.shape,
            SimpleGameStateWithTable.setPieceAt(
                this.gameStateWithTable,
                coord,
                value,
                SimpleGameStateWithTable.of,
            ),
        ) as this;
    }

    public getCenters(): Coord[] {
        return this.shape.getCenters();
    }

    public getAllCoords(): Coord[] {
        return this.shape.getAllCoords();
    }
}
