import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflState';

export class HnefataflState extends TaflState {

    public of(board: Table<TaflPawn>, turn: number): this {
        return new HnefataflState(board, turn) as this;
    }
}
