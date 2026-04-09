import { IterativeDeepeningMinimax, Minimax } from '../../jscaip/AI/Minimax';

import { SaharaFreedomHeuristic } from './SaharaFreedomHeuristic';
import { SaharaMove } from './SaharaMove';
import { SaharaMoveGenerator } from './SaharaMoveGenerator';
import { SaharaRules } from './SaharaRules';
import { SaharaState } from './SaharaState';

export class SaharaFreedomMinimax extends Minimax<SaharaMove, SaharaState> {

    public constructor() {
        super($localize`Freedom`,
              SaharaRules.get(),
              new SaharaFreedomHeuristic(),
              new SaharaMoveGenerator());
        this.transpositionTables = false;
    }

}

export class IDSaharaFreedomMinimax extends IterativeDeepeningMinimax<SaharaMove, SaharaState> {

    public constructor() {
        super($localize`IDSahara`,
              SaharaRules.get(),
              new SaharaFreedomHeuristic(),
              new SaharaMoveGenerator());
    }

}
