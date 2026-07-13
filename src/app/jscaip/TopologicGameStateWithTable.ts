import { Coord } from './Coord';
import { SimpleGameStateWithTable } from './state/SimpleGameStateWithTable';

import { TopologicGameState } from './TopologicGameState';
import { Topology } from './Topology';

export class TopologicGameStateWithTable<P extends NonNullable<unknown>> extends TopologicGameState<P> {

    public constructor(topology: Topology,
                       private readonly gameStateWithTable: SimpleGameStateWithTable<P>,
    ) {
        super(gameStateWithTable.turn, topology);
    }

    public getPieceAt(coord: Coord): P {
        return this.gameStateWithTable.getPieceAt(coord);
    }

    public hasPieceAt(coord: Coord, value: P): boolean {
        const bo: boolean = this.gameStateWithTable.hasPieceAt(coord, value);
        return bo;
    }

    public isNotOnBoard(coord: Coord): boolean {
        return this.gameStateWithTable.isNotOnBoard(coord);
    }

    public override incrementTurn(): this {
        return new TopologicGameStateWithTable(
            this.topology,
            this.gameStateWithTable.incrementTurn(),
        ) as this;
    }

    public setPieceAt(coord: Coord, value: P): this {
        return new TopologicGameStateWithTable(
            this.topology,
            SimpleGameStateWithTable.setPieceAt(
                this.gameStateWithTable,
                coord,
                value,
                SimpleGameStateWithTable.of,
            ),
        ) as this;
    }
}

