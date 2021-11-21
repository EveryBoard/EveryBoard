import { MGPNode } from 'src/app/jscaip/MGPNode';
import { tablutConfig } from './tablutConfig';
import { TaflLegalityStatus } from '../TaflLegalityStatus';
import { TablutMove } from './TablutMove';
import { TablutState } from './TablutState';
import { TaflRules } from '../TaflRules';

export abstract class TablutNode extends MGPNode<TablutRules, TablutMove, TablutState, TaflLegalityStatus> {}

export class TablutRules extends TaflRules<TablutMove, TablutState> {

    private static singleton: TablutRules;

    public static get(): TablutRules {
        if (TablutRules.singleton == null) {
            TablutRules.singleton = new TablutRules();
        }
        return TablutRules.singleton;
    }
    private constructor() {
        super(TablutState, tablutConfig, TablutMove.from);
    }
}
