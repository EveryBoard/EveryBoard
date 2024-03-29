import { HeuristicUtils } from 'src/app/jscaip/AI/tests/HeuristicUtils.spec';
import { RectanglzHeuristic } from '../RectanglzHeuristic';
import { RectanglzState } from '../RectanglzState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RectanglzConfig, RectanglzRules } from '../RectanglzRules';

describe('RectanglzHeuristic', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    let heuristic: RectanglzHeuristic;
    const defaultConfig: MGPOptional<RectanglzConfig> = RectanglzRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new RectanglzHeuristic();
    });

    it('should assign a higher score when one has more pieces on board', () => {
        // Given two boards, one with more player piece than the other
        const weakState: RectanglzState = RectanglzRules.get().getInitialState(defaultConfig);

        const strongState: RectanglzState = new RectanglzState([
            [O, _, _, _, _, _, _, X],
            [_, O, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, O],
        ], 1);
        // When computing the scores
        // Then the board with the most player pieces should have the highest score
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState,
                                                               MGPOptional.empty(),
                                                               strongState,
                                                               MGPOptional.empty(),
                                                               Player.ZERO,
                                                               defaultConfig);
    });

});
