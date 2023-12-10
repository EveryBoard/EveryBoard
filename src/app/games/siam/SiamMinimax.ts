import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { SiamMoveGenerator } from './SiamMoveGenerator';
import { SiamState } from './SiamState';
import { SiamMove } from './SiamMove';
import { SiamHeuristic } from './SiamHeuristic';
import { SiamConfig, SiamLegalityInformation, SiamRules } from './SiamRules';

export class SiamMinimax extends Minimax<SiamMove, SiamState, SiamConfig, SiamLegalityInformation> {

    public constructor() {
        super($localize`Minimax`,
              SiamRules.get(),
              new SiamHeuristic(),
              new SiamMoveGenerator(),
        );
    }
}
