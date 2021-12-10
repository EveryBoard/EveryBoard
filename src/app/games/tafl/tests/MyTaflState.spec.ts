import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflState';

export class MyTaflState extends TaflState {

    public static getInitialState(): MyTaflState {
        const _: TaflPawn = TaflPawn.UNOCCUPIED;
        const O: TaflPawn = TaflPawn.INVADERS;
        const X: TaflPawn = TaflPawn.DEFENDERS;
        const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
        const board: Table<TaflPawn> = [
            [_, O, _, _, X, _, _, O, _],
            [_, _, O, _, X, _, O, _, _],
            [_, _, _, _, X, _, _, _, _],
            [_, X, X, X, A, X, X, X, _],
            [_, _, _, _, X, _, _, _, _],
            [_, _, O, _, X, _, O, _, _],
            [_, O, _, _, X, _, _, O, _],
            [O, _, _, _, X, _, _, _, O],
            [_, _, _, _, X, _, _, _, _],
        ];

        return new MyTaflState(board, 0);
    }
    public from(board: Table<TaflPawn>, turn: number): this {
        return new MyTaflState(board, turn) as this;
    }
    public isCentralThrone(coord: Coord): boolean {
        return coord.equals(new Coord(4, 3));
    }
}
