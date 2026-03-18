import { Minimax } from '../../jscaip/AI/Minimax';

import { SaharaMove } from './SaharaMove';
import { SaharaMoveGenerator } from './SaharaMoveGenerator';
import { SaharaRules } from './SaharaRules';
import { SaharaState } from './SaharaState';
import { SaharaTerritoryHeuristic } from './SaharaTerritoryHeuristic';

export class SaharaTerritoryMinimax extends Minimax<SaharaMove, SaharaState> {

    public constructor() {
        super($localize`Territory > Freedom`,
              SaharaRules.get(),
              new SaharaTerritoryHeuristic(),
              new SaharaMoveGenerator());
    }

}
