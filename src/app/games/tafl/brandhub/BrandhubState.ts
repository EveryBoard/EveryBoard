import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflState';

export class BrandhubState extends TaflState {

    public of(board: Table<TaflPawn>, turn: number): this {
        return new BrandhubState(board, turn) as this;
    }
}
