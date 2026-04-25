import { MoveGenerator } from '../../../jscaip/AI/AI';
import { IterativeDeepeningMinimax, Minimax } from '../../../jscaip/AI/Minimax';

import { MancalaConfig } from './MancalaConfig';
import { MancalaMove } from './MancalaMove';
import { MancalaRules } from './MancalaRules';
import { MancalaScoreHeuristic } from './MancalaScoreHeurisic';
import { MancalaState } from './MancalaState';

export class MancalaScoreMinimax extends Minimax<MancalaMove, MancalaState, MancalaConfig> {


    public constructor(rules: MancalaRules, moveGenerator: MoveGenerator<MancalaMove, MancalaState, MancalaConfig>) {
        super($localize`Score`,
              rules,
              new MancalaScoreHeuristic(),
              moveGenerator,
        );
        this.transpositionTables = false;
    }
}


export class IDMancalaScoreMinimax extends IterativeDeepeningMinimax<MancalaMove, MancalaState, MancalaConfig> {

    public constructor(rules: MancalaRules, moveGenerator: MoveGenerator<MancalaMove, MancalaState, MancalaConfig>) {
        super($localize`IDScore`,
              rules,
              new MancalaScoreHeuristic(),
              moveGenerator,
        );
    }

    public override hash(state: MancalaState): string {
        return `${state.turn % 2}-${JSON.stringify(state.board)}`;
    }
}
