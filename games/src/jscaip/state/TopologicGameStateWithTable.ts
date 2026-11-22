import { Coord } from '../Coord';
import { Direction } from '../direction/Direction';
import { TopologicBoardShape } from '../board-shape/TopologicBoardShape';
import { Topology } from '../topology/Topology';

import { GameStateWithTable } from './GameStateWithTable';
import { TopologicGameState } from './TopologicGameState';

export class TopologicGameStateWithTable<P extends NonNullable<unknown>, D extends Direction>
    extends TopologicGameState<P, D>
{

    public constructor(
        topology: Topology<D>,
        shape: TopologicBoardShape<D>,
        private readonly gameStateWithTable: GameStateWithTable<P>,
    ) {
        super(gameStateWithTable.turn, topology, shape);
    }

    public override getCoordsAndContents(): { coord: Coord; content: P }[] {
        return this
            .getBoardShape()
            .getAllCoords()
            .map((coord: Coord) => {
                return {
                    coord,
                    content: this.gameStateWithTable.getPieceAt(coord),
                };
            });
    }

    public getPieceAt(coord: Coord): P {
        return this.gameStateWithTable.getPieceAt(coord);
    }

    public hasPieceAt(coord: Coord, value: P): boolean {
        return this.gameStateWithTable.hasPieceAt(coord, value);
    }

    public isOnBoard(coord: Coord): boolean {
        return this.getBoardShape().isOnBoard(coord);
    }

    public isNotOnBoard(coord: Coord): boolean {
        return this.getBoardShape().isNotOnBoard(coord);
    }

    public override incrementTurn(): TopologicGameStateWithTable<P, D> {
        return new TopologicGameStateWithTable(
            this.getTopology(),
            this.getBoardShape(),
            this.gameStateWithTable.incrementTurn(),
        );
    }

    public withPieceAt(coord: Coord, value: P): this {
        return new TopologicGameStateWithTable(
            this.getTopology(),
            this.getBoardShape(),
            GameStateWithTable.withPieceAt(
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
        return this.getBoardShape().getCenters();
    }

    public getAllCoords(): Coord[] {
        return this.getBoardShape().getAllCoords();
    }
}
