import { TaflPawn } from '../TaflPawn';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflState } from '../TaflState';

export class TablutState extends TaflState {

    public static getInitialState(): TablutState {
        const _: TaflPawn = TaflPawn.UNOCCUPIED;
        const O: TaflPawn = TaflPawn.INVADERS;
        const X: TaflPawn = TaflPawn.DEFENDERS;
        const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
        const board: Table<TaflPawn> = [
            [_, _, _, O, O, O, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, _, X, _, _, _, _],
            [O, _, _, _, X, _, _, _, O],
            [O, O, X, X, A, X, X, O, O],
            [O, _, _, _, X, _, _, _, O],
            [_, _, _, _, X, _, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, O, O, O, _, _, _],
        ];

        return new TablutState(board, 0);
    }
    public from(board: Table<TaflPawn>, turn: number): this {
        return new TablutState(board, turn) as this;
    }
}
