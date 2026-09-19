/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { MoveGenerator } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { DiaballikDistanceHeuristic } from '../DiaballikDistanceHeuristic';
import { DiaballikFilteredMoveGenerator } from '../DiaballikFilteredMoveGenerator';
import { DiaballikMove } from '../DiaballikMove';
import { DiaballikMoveGenerator } from '../DiaballikMoveGenerator';
import { DiaballikRules } from '../DiaballikRules';
import { DiaballikState } from '../DiaballikState';

class DiaballikDistanceMinimax extends Minimax<DiaballikMove, DiaballikState, EmptyRulesConfig, DiaballikState> {
    public constructor(name: string, moveGenerator: MoveGenerator<DiaballikMove, DiaballikState>) {
        super(name, DiaballikRules.get(), new DiaballikDistanceHeuristic(), moveGenerator,
        );
    }
}

describe('DiaballikDistanceMinimax', () => {

    const rules: DiaballikRules = DiaballikRules.get();
    const moveGenerator: DiaballikMoveGenerator = new DiaballikFilteredMoveGenerator(3, false);
    const minimax: DiaballikDistanceMinimax = new DiaballikDistanceMinimax('distance', moveGenerator);
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = DiaballikRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: true,
        });
    });

});
