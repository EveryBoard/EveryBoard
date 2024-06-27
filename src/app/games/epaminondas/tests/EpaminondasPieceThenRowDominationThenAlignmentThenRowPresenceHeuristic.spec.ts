/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { HeuristicUtils } from 'src/app/jscaip/AI/tests/HeuristicUtils.spec';
import { MGPOptional } from '@everyboard/lib';
import { EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic } from '../EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasConfig, EpaminondasRules } from '../EpaminondasRules';

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
