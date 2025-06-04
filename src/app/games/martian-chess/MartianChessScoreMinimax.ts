import { Minimax } from '../../../app/jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../../app/jscaip/RulesConfigUtil';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessMoveGenerator } from './MartianChessMoveGenerator';
import { MartianChessMoveResult, MartianChessRules } from './MartianChessRules';
import { MartianChessScoreHeuristic } from './MartianChessScoreHeuristic';
import { MartianChessState } from './MartianChessState';

export class MartianChessScoreMinimax
    extends Minimax<MartianChessMove, MartianChessState, EmptyRulesConfig, MartianChessMoveResult> {

    public constructor() {
        super($localize`Score`,
              MartianChessRules.get(),
              new MartianChessScoreHeuristic(),
              new MartianChessMoveGenerator());
    }

}
