import { Minimax } from 'src/app/jscaip/Minimax';
import { SixMove } from './SixMove';
import { SixState } from './SixState';
import { SixLegalityInformation, SixRules } from './SixRules';
import { SixHeuristic } from './SixHeuristic';
import { SixFilteredMoveGenerator } from './SixFilteredMoveGenerator';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

export class SixMinimax extends Minimax<SixMove, SixState, EmptyRulesConfig, SixLegalityInformation> {

    public constructor() {
        super($localize`Minimax`, SixRules.get(), new SixHeuristic(), new SixFilteredMoveGenerator());
    }

}
