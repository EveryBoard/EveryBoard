/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflState';

export class MyTaflState extends TaflState {

    public override of(board: Table<TaflPawn>, turn: number): this {
        return new MyTaflState(board, turn) as this;
    }

    public override isCentralThrone(coord: Coord): boolean {
        return coord.equals(new Coord(4, 3));
    }
}
