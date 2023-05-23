/* eslint-disable max-lines-per-function */
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflRules } from '../TaflRules';
import { MyTaflMove } from './MyTaflMove.spec';
import { MyTaflState } from './MyTaflState.spec';
import { myTaflConfig } from './TaflRules.spec';

export class MyTaflRules extends TaflRules<MyTaflMove, MyTaflState> {

    private static singleton: MGPOptional<MyTaflRules> = MGPOptional.empty();

    public static get(): MyTaflRules {
        if (MyTaflRules.singleton.isAbsent()) {
            MyTaflRules.singleton = MGPOptional.of(new MyTaflRules());
        }
        return MyTaflRules.singleton.get();
    }
    private constructor() {
        super(MyTaflState, myTaflConfig, MyTaflMove.from);
    }
}
