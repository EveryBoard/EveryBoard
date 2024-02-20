import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { MancalaMove } from './MancalaMove';
import { MancalaState } from '../common/MancalaState';
import { MancalaRules } from './MancalaRules';
import { MancalaScoreHeuristic } from './MancalaScoreHeurisic';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { MancalaConfig } from './MancalaConfig';

export class MancalaScoreMinimax extends Minimax<MancalaMove, MancalaState, MancalaConfig> {

    public constructor(rules: MancalaRules, moveGenerator: MoveGenerator<MancalaMove, MancalaState, MancalaConfig>) {
        super($localize`Score`,
              rules,
              new MancalaScoreHeuristic(),
              moveGenerator,
        );
    }
}
