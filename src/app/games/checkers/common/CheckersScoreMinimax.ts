import { Minimax } from '../../../jscaip/AI/Minimax';
import { CheckersMove } from './CheckersMove';
import { CheckersState } from '../common/CheckersState';
import { AbstractCheckersRules, CheckersConfig } from './AbstractCheckersRules';
import { MoveGenerator } from '../../../jscaip/AI/AI';
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
