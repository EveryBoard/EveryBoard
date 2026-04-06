import { Minimax } from '../../jscaip/AI/Minimax';

import { SaharaMobilityHeuristic } from './SaharaMobilityHeuristic';
import { SaharaMove } from './SaharaMove';
import { SaharaMoveGenerator } from './SaharaMoveGenerator';
import { SaharaRules } from './SaharaRules';
import { SaharaState } from './SaharaState';

export class SaharaMobilityMinimax extends Minimax<SaharaMove, SaharaState> {

    public constructor() {
        super($localize`Mobility`,
              SaharaRules.get(),
              new SaharaMobilityHeuristic(SaharaRules.get()),
              new SaharaMoveGenerator());
        this.random = true;
    }

}
