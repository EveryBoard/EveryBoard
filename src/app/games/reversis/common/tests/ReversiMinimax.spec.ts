/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../../utils/tests/TestUtils.spec';
import { ReversiRules } from '../../reversi/ReversiRules';
import { ReversiConfig, ReversiLegalityInformation, ReversiNode } from '../AbstractReversiRules';
import { ReversiHeuristic } from '../ReversiHeuristic';
import { ReversiMove } from '../ReversiMove';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';
import { ReversiState } from '../ReversiState';

class ReversiMinimax extends Minimax<ReversiMove, ReversiState, ReversiConfig, ReversiLegalityInformation> {
    public constructor() {
        super('Minimax', ReversiRules.get(), new ReversiHeuristic(), new ReversiMoveGenerator(ReversiRules.get()));
    }
}

describe('ReversiMinimax', () => {

    const rules: ReversiRules = ReversiRules.get();
    const defaultConfig: ReversiConfig = rules.getDefaultRulesConfig();
    const minimax: ReversiMinimax = new ReversiMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };

    it('should not throw at first choice', () => {
        const node: ReversiNode = rules.getInitialNode(defaultConfig);
        const bestMove: ReversiMove = minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        expect(rules.isLegal(bestMove, node.gameState, defaultConfig).isSuccess()).toBeTrue();
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
