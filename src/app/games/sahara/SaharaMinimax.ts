import { Minimax } from '../../jscaip/AI/Minimax';
import { SaharaHeuristic } from './SaharaHeuristic';
import { SaharaMove } from './SaharaMove';
import { SaharaMoveGenerator } from './SaharaMoveGenerator';
import { SaharaRules } from './SaharaRules';
import { SaharaState } from './SaharaState';

export class SaharaMinimax extends Minimax<SaharaMove, SaharaState> {

    public constructor() {
        super($localize`Sahara`,
              SaharaRules.get(),
              new SaharaHeuristic(),
              new SaharaMoveGenerator());
    }

}
