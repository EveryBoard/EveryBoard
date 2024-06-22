import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { SaharaMove } from './SaharaMove';
import { SaharaMoveGenerator } from './SaharaMoveGenerator';
import { SaharaRules } from './SaharaRules';
import { SaharaHeuristic } from './SaharaHeuristic';
import { SaharaState } from './SaharaState';

export class SaharaMinimax extends Minimax<SaharaMove, SaharaState> {

    public constructor() {
        super($localize`Sahara`,
              SaharaRules.get(),
              new SaharaHeuristic(),
              new SaharaMoveGenerator());
    }

}
