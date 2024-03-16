import { RectanglzState } from '../RectanglzState';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { RectanglzMove } from '../RectanglzMove';
import { RectanglzNode, RectanglzRules } from '../RectanglzRules';
import { RectanglzMinimax } from '../RectanglzMinimax';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

/**
 * These are the tests for the minimax.
 * We want to test that it selects a certain move on a specific board.
 */
describe('RectanglzMinimax', () => {

    let minimax: Minimax<RectanglzMove, RectanglzState>;
    const defaultConfig: NoConfig = RectanglzRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new RectanglzMinimax();
    });

    it('should select some move', () => {
        // Given state
        const state: RectanglzState = RectanglzRules.get().getInitialState();
        const node: RectanglzNode = new RectanglzNode(state);

        // When selecting the best move
        const bestMove: RectanglzMove = minimax.chooseNextMove(node, { name: 'Level 1', maxDepth: 1 }, defaultConfig);
        // Then it should be the move I want it to be
        expect(bestMove).toBeTruthy();
    });

});
