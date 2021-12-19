import { TaflRules } from '../TaflRules';
import { MyTaflMove } from './MyTaflMove.spec';
import { MyTaflState } from './MyTaflState.spec';
import { myTaflConfig } from './TaflRules.spec';

export class MyTaflRules extends TaflRules<MyTaflMove, MyTaflState> {

    private static singleton: MyTaflRules;

    public static get(): MyTaflRules {
        if (MyTaflRules.singleton == null) {
            MyTaflRules.singleton = new MyTaflRules();
        }
        return MyTaflRules.singleton;
    }
    private constructor() {
        super(MyTaflState, myTaflConfig, MyTaflMove.from);
    }
}
