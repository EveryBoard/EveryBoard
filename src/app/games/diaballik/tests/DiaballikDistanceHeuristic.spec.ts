import { Player } from '@everyboard/games';
import { HeuristicUtils } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { DiaballikDistanceHeuristic } from '../DiaballikDistanceHeuristic';
import { DiaballikRules } from '../DiaballikRules';
import { DiaballikPiece, DiaballikState } from '../DiaballikState';

describe('DiaballikDistanceHeuristic', () => {

    let heuristic: DiaballikDistanceHeuristic;
    const defaultConfig: EmptyRulesConfig = DiaballikRules.get().getDefaultRulesConfig();

    const O: DiaballikPiece = DiaballikPiece.ZERO;
    const Ȯ: DiaballikPiece = DiaballikPiece.ZERO_WITH_BALL;
    const X: DiaballikPiece = DiaballikPiece.ONE;
    const Ẋ: DiaballikPiece = DiaballikPiece.ONE_WITH_BALL;
    const _: DiaballikPiece = DiaballikPiece.NONE;

    beforeEach(() => {
        heuristic = new DiaballikDistanceHeuristic();
    });

    it('should prefer states where the ball is closest to opponent line', () => {
        // Given two states, where one has the ball closest to the opponent line
        const weakState: DiaballikState = new DiaballikState([
            [X, X, X, Ẋ, _, X, X],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, Ȯ, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [O, O, O, _, _, O, O],
        ], 0);
        const strongState: DiaballikState = new DiaballikState([
            [X, X, X, Ẋ, _, X, X],
            [_, _, _, _, Ȯ, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [O, O, O, _, _, O, O],
        ], 0);
        // When computing their heuristic value

        // Then it should prefer the one with the ball closest to opponent line
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ZERO,
                                                               defaultConfig);
    });

});
