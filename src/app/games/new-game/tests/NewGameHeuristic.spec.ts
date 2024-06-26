import { HeuristicUtils } from 'src/app/jscaip/AI/tests/HeuristicUtils.spec';
import { NewGameHeuristic } from '../NewGameHeuristic';
import { NewGameState } from '../NewGameState';
import { MGPOptional } from '@everyboard/lib';
import { Player } from 'src/app/jscaip/Player';
import { NewGameRules } from '../NewGameRules';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

/**
 * These are the tests for the heuristic.
 * We want to test that it gives some value on some boards, or rather that it assigns higher values to a board
 * compared to another one.
 * We can rely on HeuristicUtils' functions to achieve this.
 */
describe('NewGameHeuristic', () => {

    let heuristic: NewGameHeuristic;
    const defaultConfig: NoConfig = NewGameRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new NewGameHeuristic();
    });

    it('should have some board value', () => {
        /**
         * To test board values, most of the time you want to rely on
         * `HeuristicUtils.expectSecondStateToBeBetterThanFirstFor`.
         * You can include last moves when needed (here there are set to MGPOptional.empty())
         */
        const weakState: NewGameState = NewGameRules.get().getInitialState();
        const strongState: NewGameState = new NewGameState(42);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

});
