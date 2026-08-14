import { Player, PlayerOrNone } from '@everyboard/games';
import { HeuristicUtils } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { SquarzHeuristic } from '../SquarzHeuristic';
import { SquarzConfig, SquarzRules } from '../SquarzRules';
import { SquarzState } from '../SquarzState';

describe('SquarzHeuristic', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    let heuristic: SquarzHeuristic;
    const defaultConfig: SquarzConfig = SquarzRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new SquarzHeuristic();
    });

    it('should assign a higher score when one has more pieces on board', () => {
        // Given two boards, one with more player pieces than the other
        const weakState: SquarzState = SquarzRules.get().getInitialState(defaultConfig);

        const strongState: SquarzState = new SquarzState([
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
