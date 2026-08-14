/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from '@everyboard/games';
import { HeuristicUtils } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { LinesOfActionHeuristic } from '../LinesOfActionHeuristic';
import { LinesOfActionRules } from '../LinesOfActionRules';
import { LinesOfActionState } from '../LinesOfActionState';

describe('LinesOfActionHeuristic', () => {

    let heuristic: LinesOfActionHeuristic;
    const defaultConfig: EmptyRulesConfig = LinesOfActionRules.get().getDefaultRulesConfig();

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(() => {
        heuristic = new LinesOfActionHeuristic();
    });

    it('should prefer fewer groups', () => {
        // Given a state with fewer groups than another
        const strongState: LinesOfActionState = new LinesOfActionState([
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [O, O, _, _, X, _, _, _],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, _],
        ], 0);
        const weakState: LinesOfActionState = new LinesOfActionState([
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [O, _, O, _, X, _, _, _],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, _],
        ], 0);
        // When computing their values
        // Then it should prefer having less groups
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ZERO,
                                                               defaultConfig);
    });

});
