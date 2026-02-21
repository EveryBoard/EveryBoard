/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic } from '../EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic';
import { EpaminondasConfig, EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasState } from '../EpaminondasState';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic', () => {

    let heuristic: EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic;
    const defaultConfig: MGPOptional<EpaminondasConfig> = EpaminondasRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic();
    });

    it('should prefer having more pieces', () => {
        const weakerState: EpaminondasState = new EpaminondasState([
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, O, O, _, _, _, _, _, _, _, _, _, _, _],
        ], 1);
        const strongerState: EpaminondasState = new EpaminondasState([
            [_, _, _, _, _, _, _, _, _, X, X, X, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, O, O, _, _, _, _, _, _, _, _, _, _, _],
        ], 1);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakerState, MGPOptional.empty(),
                                                               strongerState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

    it('should consider two neighbor piece better than two separated piece', () => {
        const weakerState: EpaminondasState = new EpaminondasState([
            [_, _, _, _, _, _, _, _, _, X, _, X, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, O, O, _, _, _, _, _, _, _, _, _, _, _],
        ], 1);
        const strongerState: EpaminondasState = new EpaminondasState([
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, O, O, _, _, _, _, _, _, _, _, _, _, _],
        ], 1);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakerState, MGPOptional.empty(),
                                                               strongerState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

});
