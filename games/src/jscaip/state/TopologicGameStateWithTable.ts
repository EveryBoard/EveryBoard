import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { TopologicShape } from '../shape/TopologicShape';
import { Topology } from '../topology/Topology';

import { GameStateWithTable } from './GameStateWithTable';
import { SimpleGameStateWithTable } from './SimpleGameStateWithTable';
import { TopologicGameState } from './TopologicGameState';

export class TopologicGameStateWithTable<P extends NonNullable<unknown>, D extends Direction>
    extends TopologicGameState<P, D>
{

    public constructor(
        topology: Topology<D>,
        shape: TopologicShape<D>,
        private readonly gameStateWithTable: SimpleGameStateWithTable<P>,
    ) {
        super(gameStateWithTable.turn, topology, shape);
    }

    public override getCoordsAndContents(): { coord: Coord; content: P }[] {
        return this.gameStateWithTable.getCoordsAndContents();
    }

    public getPieceAt(coord: Coord): P {
        return this.gameStateWithTable.getPieceAt(coord);
    }

    public hasPieceAt(coord: Coord, value: P): boolean {
        return this.gameStateWithTable.hasPieceAt(coord, value);
    }

    public isOnBoard(coord: Coord): boolean {
        return this.getShape().isOnBoard(coord);
    }

    public isNotOnBoard(coord: Coord): boolean {
        return this.getShape().isNotOnBoard(coord);
    }

    public override incrementTurn(): TopologicGameStateWithTable<P, D> {
        return new TopologicGameStateWithTable(
            this.getTopology(),
            this.getShape(),
            this.gameStateWithTable.incrementTurn(),
        );
    }

    public withPieceAt(coord: Coord, value: P): this {
        return new TopologicGameStateWithTable(
            this.getTopology(),
            this.getShape(),
            SimpleGameStateWithTable.withPieceAt(
                this.gameStateWithTable,
                coord,
                value,
                (oldState: GameStateWithTable<P>, newBoard: P[][]) => {
                    return new GameStateWithTable(newBoard, oldState.turn);
                },
            ),
        ) as this;
    }

    public getCenters(): Coord[] {
        return this.getShape().getCenters();
    }

    public getAllCoords(): Coord[] {
        return this.getShape().getAllCoords();
    }
}
