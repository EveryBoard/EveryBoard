import { MoveGenerator } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { MancalaState } from '../common/MancalaState';
import { MancalaConfig } from './MancalaConfig';
import { MancalaMove } from './MancalaMove';
import { MancalaRules } from './MancalaRules';
import { MancalaScoreHeuristic } from './MancalaScoreHeurisic';

export class MancalaScoreMinimax extends Minimax<MancalaMove, MancalaState, MancalaConfig> {

    public constructor(rules: MancalaRules, moveGenerator: MoveGenerator<MancalaMove, MancalaState, MancalaConfig>) {
        super($localize`Score`,
              rules,
              new MancalaScoreHeuristic(),
              moveGenerator,
        );
    }
}
