import { Minimax } from 'src/app/jscaip/Minimax';
import { SiamMoveGenerator } from './SiamMoveGenerator';
import { SiamState } from './SiamState';
import { SiamMove } from './SiamMove';
import { SiamHeuristic } from './SiamHeuristic';
import { SiamLegalityInformation, SiamRules } from './SiamRules';

export class SiamMinimax extends Minimax<SiamMove, SiamState, SiamLegalityInformation> {

    public constructor() {
        super($localize`Minimax`, SiamRules.get(), new SiamHeuristic(), new SiamMoveGenerator());
    }
}
