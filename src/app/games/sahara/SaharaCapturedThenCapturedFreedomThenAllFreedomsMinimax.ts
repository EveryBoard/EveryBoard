import { Minimax, IterativeDeepeningMinimax } from '../../jscaip/AI/Minimax';

import { SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic } from './SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic';
import { SaharaMove } from './SaharaMove';
import { SaharaMoveGenerator } from './SaharaMoveGenerator';
import { SaharaRules } from './SaharaRules';
import { SaharaState } from './SaharaState';

export class SaharaCapturedThenCapturedFreedomThenAllFreedomsMinimax extends Minimax<SaharaMove, SaharaState> {

    public constructor() {
        super($localize`Capture > Captured Freedom > All Freedoms`,
              SaharaRules.get(),
              new SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic(SaharaRules.get()),
              new SaharaMoveGenerator());
        this.random = true;
        this.transpositionTables = false;
    }

}

export class IDSaharaCapturedThenCapturedFreedomThenAllFreedomsMinimax
    extends IterativeDeepeningMinimax<SaharaMove, SaharaState> {

    public constructor() {
        super($localize`ID Capture > Captured Freedom > All Freedoms`,
              SaharaRules.get(),
              new SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic(SaharaRules.get()),
              new SaharaMoveGenerator());
        this.random = true;
    }

}
