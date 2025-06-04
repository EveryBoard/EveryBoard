import { Minimax } from '../../../app/jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../../app/jscaip/RulesConfigUtil';
import { YinshMove } from './YinshMove';
import { YinshMoveGenerator } from './YinshMoveGenerator';
import { YinshLegalityInformation, YinshRules } from './YinshRules';
import { YinshScoreHeuristic } from './YinshScoreHeuristic';
import { YinshState } from './YinshState';

export class YinshScoreMinimax extends Minimax<YinshMove, YinshState, EmptyRulesConfig, YinshLegalityInformation> {

    public constructor() {
        super($localize`Score`,
              YinshRules.get(),
              new YinshScoreHeuristic(),
              new YinshMoveGenerator());
    }

}
