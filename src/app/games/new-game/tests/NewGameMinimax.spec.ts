import { NewGameState } from '../NewGameState';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NewGameMove } from '../NewGameMove';
import { NewGameConfig, NewGameLegalityInfo, NewGameNode, NewGameRules } from '../NewGameRules';
import { NewGameMinimax } from '../NewGameMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';

/**
 * These are the tests for the minimax.
 * We want to test that it selects a certain move on a specific board.
 */
describe('NewGameMinimax', () => {

    let minimax: Minimax<NewGameMove, NewGameState, NewGameConfig, NewGameLegalityInfo>;
    const defaultConfig: MGPOptional<NewGameConfig> = NewGameRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new NewGameMinimax();
    });

    it('should select some move', () => {
        // Given state
        const state: NewGameState = NewGameRules.get().getInitialState();
        const node: NewGameNode = new NewGameNode(state);

        // When selecting the best move
        const bestMove: NewGameMove = minimax.chooseNextMove(node, { name: 'Level 1', maxDepth: 1 }, defaultConfig);
        // Then it should be the move I want it to be
        expect(bestMove).toBeTruthy();
    });
});
