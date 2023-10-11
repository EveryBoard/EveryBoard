/* eslint-disable max-lines-per-function */
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflNode, TaflRules } from '../TaflRules';
import { MyTaflMove } from './MyTaflMove.spec';
import { MyTaflState } from './MyTaflState.spec';
import { myTaflConfig } from './TaflRules.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';

export class MyTaflNode extends TaflNode<MyTaflMove, MyTaflState> {}

export class MyTaflRules extends TaflRules<MyTaflMove, MyTaflState> {

    private static singleton: MGPOptional<MyTaflRules> = MGPOptional.empty();

    public static get(): MyTaflRules {
        if (MyTaflRules.singleton.isAbsent()) {
            MyTaflRules.singleton = MGPOptional.of(new MyTaflRules());
        }
        return MyTaflRules.singleton.get();
    }

    private constructor() {
        super(myTaflConfig, MyTaflMove.from);
    }

    public getInitialState(): MyTaflState {
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

}
