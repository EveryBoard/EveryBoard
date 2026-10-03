/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../../jscaip/AI/AI';
import { Minimax } from '../../../../jscaip/AI/Minimax';
import { minimaxTest, SlowTest } from '../../../../utils/tests/TestUtils.spec';
import { ReversiRules } from '../../reversi/ReversiRules';
import { ReversiConfig, ReversiLegalityInformation, ReversiNode } from '../AbstractReversiRules';
import { ReversiHeuristic } from '../ReversiHeuristic';
import { ReversiMove } from '../ReversiMove';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';
import { ReversiState } from '../ReversiState';

const rules: ReversiRules = ReversiRules.get();
class ReversiMinimax extends Minimax<ReversiMove, ReversiState, ReversiConfig, ReversiLegalityInformation> {
    public constructor() {
        super(
            'Minimax',
            rules,
            new ReversiHeuristic(rules),
            new ReversiMoveGenerator(rules),
        );
    }
}

fdescribe('ReversiMinimax', () => {

    const defaultConfig: ReversiConfig = rules.getDefaultRulesConfig();
    const minimax: ReversiMinimax = new ReversiMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };

    it('should not throw at first choice', () => {
        const node: ReversiNode = rules.getInitialNode(defaultConfig);
        const bestMove: ReversiMove = minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        expect(rules.isLegal(bestMove, node.gameState).isSuccess()).toBeTrue();
    });

    SlowTest.it('should be able to play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: true,
        });
    });

});
