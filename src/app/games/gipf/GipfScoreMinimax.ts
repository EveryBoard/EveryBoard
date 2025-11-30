import { Minimax } from '../../jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../jscaip/RulesConfigUtil';
import { GipfMove } from './GipfMove';
import { GipfMoveGenerator } from './GipfMoveGenerator';
import { GipfLegalityInformation, GipfRules } from './GipfRules';
import { GipfScoreHeuristic } from './GipfScoreHeuristic';
import { GipfState } from './GipfState';

export class GipfScoreMinimax extends Minimax<GipfMove, GipfState, EmptyRulesConfig, GipfLegalityInformation> {

    public constructor() {
        super($localize`Score`,
              GipfRules.get(),
              new GipfScoreHeuristic(),
              new GipfMoveGenerator());
    }

}
