import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflState';

export class HnefataflState extends TaflState {

    public static getInitialState(): HnefataflState {
        const _: TaflPawn = TaflPawn.UNOCCUPIED;
        const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
        const X: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
        const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
        const board: Table<TaflPawn> = [
            [_, _, _, O, O, O, O, O, _, _, _],
            [_, _, _, _, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, X, _, _, _, _, O],
            [O, _, _, _, X, X, X, _, _, _, O],
            [O, O, _, X, X, A, X, X, _, O, O],
            [O, _, _, _, X, X, X, _, _, _, O],
            [O, _, _, _, _, X, _, _, _, _, O],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, O, _, _, _, _, _],
            [_, _, _, O, O, O, O, O, _, _, _],
        ];
        return new HnefataflState(board, 0);
    }
    public of(board: Table<TaflPawn>, turn: number): this {
        return new HnefataflState(board, turn) as this;
    }
}
