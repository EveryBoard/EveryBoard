/* eslint-disable max-lines-per-function */
import { EmptyRulesConfig } from '../../../config/RulesConfigUtil';
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { MartianChessMove } from '../MartianChessMove';
import { MartianChessMoveGenerator } from '../MartianChessMoveGenerator';
import { MartianChessRules } from '../MartianChessRules';
import { MartianChessMoveResult } from '../MartianChessRules';
import { MartianChessScoreHeuristic } from '../MartianChessScoreHeuristic';
import { MartianChessState } from '../MartianChessState';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

class MartianChessScoreMinimax
    extends Minimax<MartianChessMove, MartianChessState, EmptyRulesConfig, MartianChessMoveResult> {
    public constructor() {
        super('Score', MartianChessRules.get(), new MartianChessScoreHeuristic(), new MartianChessMoveGenerator());
    }
}

describe('MartianChessScoreMinimax', () => {

    const rules: MartianChessRules = MartianChessRules.get();
    const minimax: MartianChessScoreMinimax = new MartianChessScoreMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = MartianChessRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not a finisher
        });
    });

});
