import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { NewGameHeuristic } from '../NewGameHeuristic';
import { NewGameState } from '../NewGameState';

/**
 * These are the tests for the heuristic.
 * We want to test that it gives some value on some boards, or rather that it assigns higher values to a board
 * compared to another one.
 * We can rely on HeuristicUtils' functions to achieve this.
 */
describe('NewGameHeuristic', () => {

    let heuristic: NewGameHeuristic;

    beforeEach(() => {
        heuristic = new NewGameHeuristic();
    });
    it('should have some board value', () => {
        /**
         * To test board values, most of the time you want to rely on
         * `HeuristicUtils.expectSecondStateToBeBetterThanFirstFor`.
         */
        const initialState: NewGameState = NewGameState.getInitialState();
        HeuristicUtils.expectStatesToBeOfEqualValue(heuristic, initialState, initialState);
    });
});
