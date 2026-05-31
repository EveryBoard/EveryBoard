/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../../jscaip/AI/AI';
import { Minimax } from '../../../../jscaip/AI/Minimax';
import { minimaxTest, SlowTest } from '../../../../utils/tests/TestUtils.spec';
import { GoLegalityInformation } from '../../AbstractGoRules';
import { GoMove } from '../../GoMove';
import { GoState } from '../../GoState';
import { GoHeuristic } from '../GoHeuristic';
import { GoMoveGenerator } from '../GoMoveGenerator';
import { GoConfig, GoRules } from '../GoRules';

describe('Go territory profile', () => {

    const rules: GoRules = GoRules.get();
    const minimax: Minimax<GoMove, GoState, GoConfig, GoLegalityInformation> =
        new Minimax($localize`Territory`, rules, new GoHeuristic(), new GoMoveGenerator());
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: GoConfig = GoRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not a finisher, 3 seconds per turn
        });
    });

    SlowTest.it('should be able play against itself (smaller finishable config)', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: {
                ...defaultConfig,
                height: 3,
                width: 3,
            },
            shouldFinish: true,
        });
    });

});
