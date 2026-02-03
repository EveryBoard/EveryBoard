import { MoveGenerator } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { CheckersState } from '../common/CheckersState';
import { AbstractCheckersRules, CheckersConfig } from './AbstractCheckersRules';
import { CheckersMove } from './CheckersMove';
import { CheckersScoreHeuristic } from './CheckersScoreHeuristic';

export class CheckersScoreMinimax extends Minimax<CheckersMove, CheckersState, CheckersConfig> {

    public constructor(rules: AbstractCheckersRules,
                       moveGenerator: MoveGenerator<CheckersMove, CheckersState, CheckersConfig>)
    {
        super($localize`Score`,
              rules,
              new CheckersScoreHeuristic(),
              moveGenerator,
        );
    }
}
