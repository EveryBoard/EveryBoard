/* eslint-disable max-lines-per-function */
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflNode, TaflRules } from '../TaflRules';
import { MyTaflMove } from './MyTaflMove.spec';
import { MyTaflState } from './MyTaflState.spec';
import { TaflConfig } from '../TaflConfig';

export class MyTaflNode extends TaflNode<MyTaflMove, MyTaflState> {}

export class MyTaflRules extends TaflRules<MyTaflMove, MyTaflState> {

    public static readonly DEFAULT_CONFIG: TaflConfig = {
        castleIsLeftForGood: true,
        invaderStarts: true,
        kingFarFromHomeCanBeSandwiched: true,
        centralThroneCanSurroundKing: true,
        edgesAreKingsEnnemy: true,
    };

    private static singleton: MGPOptional<MyTaflRules> = MGPOptional.empty();

    public static get(): MyTaflRules {
        if (MyTaflRules.singleton.isAbsent()) {
            MyTaflRules.singleton = MGPOptional.of(new MyTaflRules());
        }
        return MyTaflRules.singleton.get();
    }
    private constructor() {
        super(MyTaflState, MyTaflRules.DEFAULT_CONFIG, MyTaflMove.from);
    }
}
