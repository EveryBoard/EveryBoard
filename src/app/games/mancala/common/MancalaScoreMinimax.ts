import { Minimax } from 'src/app/jscaip/Minimax';
import { MancalaMove } from './MancalaMove';
import { MancalaState } from '../common/MancalaState';
import { MancalaRules } from './MancalaRules';
import { MancalaScoreHeuristic } from './MancalaScoreHeurisic';
import { MoveGenerator } from 'src/app/jscaip/AI';

export class MancalaScoreMinimax extends Minimax<MancalaMove, MancalaState> {

    public constructor(rules: MancalaRules, moveGenerator: MoveGenerator<MancalaMove, MancalaState>) {
        super($localize`Score`, rules, new MancalaScoreHeuristic(), moveGenerator);
    }
}
