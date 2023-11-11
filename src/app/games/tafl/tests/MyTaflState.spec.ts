/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflState';
import { TaflConfig } from '../TaflConfig';

export class MyTaflState extends TaflState {

    public static getInitialState(_config: TaflConfig): MyTaflState {
        const _: TaflPawn = TaflPawn.UNOCCUPIED;
        const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
        const X: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
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
    public of(board: Table<TaflPawn>, turn: number): this {
        return new MyTaflState(board, turn) as this;
    }
    public override isCentralThrone(coord: Coord): boolean {
        return coord.equals(new Coord(4, 3));
    }
}
