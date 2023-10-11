import { TaflPawn } from '../TaflPawn';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflState } from '../TaflState';

export class TablutState extends TaflState {

    public of(board: Table<TaflPawn>, turn: number): this {
        return new TablutState(board, turn) as this;
    }
}
