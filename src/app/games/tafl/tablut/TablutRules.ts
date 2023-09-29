import { GameNode } from 'src/app/jscaip/GameNode';
import { TablutMove } from './TablutMove';
import { TablutState } from './TablutState';
import { TaflRules } from '../TaflRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflConfig } from '../TaflConfig';

export class TablutNode extends GameNode<TablutMove, TablutState> {}

export class TablutRules extends TaflRules<TablutMove, TablutState> {

    private static singleton: MGPOptional<TablutRules> = MGPOptional.empty();

    public static readonly DEFAULT_CONFIG: TaflConfig = {
        castleIsLeftForGood: false,
        borderCanSurroundKing: true,
        centralThroneCanSurroundKing: false,
        kingFarFromHomeCanBeSandwiched: false,
        invaderStarts: true,
    };

    public static get(): TablutRules {
        if (TablutRules.singleton.isAbsent()) {
            TablutRules.singleton = MGPOptional.of(new TablutRules());
        }
        return TablutRules.singleton.get();
    }
    private constructor() {
        super(TablutState, TablutRules.DEFAULT_CONFIG, TablutMove.from);
    }
}
