import { HeuristicUtils } from 'src/app/jscaip/AI/tests/HeuristicUtils.spec';
import { RectanglzHeuristic } from '../RectanglzHeuristic';
import { RectanglzState } from '../RectanglzState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { RectanglzRules } from '../RectanglzRules';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

xdescribe('RectanglzHeuristic', () => {

    let heuristic: RectanglzHeuristic;
    const defaultConfig: NoConfig = RectanglzRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new RectanglzHeuristic();
    });

    it('should have some board value', () => {
        /**
         * To test board values, most of the time you want to rely on
         * `HeuristicUtils.expectSecondStateToBeBetterThanFirstFor`.
         * You can include last moves when needed (here there are set to MGPOptional.empty())
         */
        const weakState: RectanglzState = RectanglzRules.get().getInitialState();
        const strongState: RectanglzState = new RectanglzState([], 42);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

});
