import { MGPNode } from 'src/app/jscaip/MGPNode';
import { tablutConfig } from './tablutConfig';
import { TablutMove } from './TablutMove';
import { TablutState } from './TablutState';
import { TaflRules } from '../TaflRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class TablutNode extends MGPNode<TablutRules, TablutMove, TablutState> {}

export class TablutRules extends TaflRules<TablutMove, TablutState> {

    private static singleton: MGPOptional<TablutRules> = MGPOptional.empty();

    public static get(): TablutRules {
        if (TablutRules.singleton.isAbsent()) {
            TablutRules.singleton = MGPOptional.of(new TablutRules());
        }
        return TablutRules.singleton.get();
    }
    private constructor() {
        super(TablutState, tablutConfig, TablutMove.of);
    }
}
