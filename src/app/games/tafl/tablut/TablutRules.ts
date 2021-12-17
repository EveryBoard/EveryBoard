import { MGPNode } from 'src/app/jscaip/MGPNode';
import { tablutConfig } from './tablutConfig';
import { TablutMove } from './TablutMove';
import { TablutState } from './TablutState';
import { TaflRules } from '../TaflRules';

export class TablutNode extends MGPNode<TablutRules, TablutMove, TablutState> {}

export class TablutRules extends TaflRules<TablutMove, TablutState> {

    private static singleton: TablutRules;

    public static get(): TablutRules {
        if (TablutRules.singleton == null) {
            TablutRules.singleton = new TablutRules();
        }
        MGPNode.ruler = this.singleton;
        return TablutRules.singleton;
    }
    private constructor() {
        super(TablutState, tablutConfig, TablutMove.of);
    }
}
