import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { MancalaMove } from './MancalaMove';
import { MancalaState } from '../common/MancalaState';
import { MancalaRules } from './MancalaRules';
import { MancalaScoreHeuristic } from './MancalaScoreHeurisic';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';

export class MancalaScoreMinimax<M extends MancalaMove> extends Minimax<M, MancalaState> {

    public constructor(rules: MancalaRules<M>, moveGenerator: MoveGenerator<M, MancalaState>) {
        super($localize`Score`,
              rules,
              new MancalaScoreHeuristic(),
              moveGenerator,
        );
    }
}
