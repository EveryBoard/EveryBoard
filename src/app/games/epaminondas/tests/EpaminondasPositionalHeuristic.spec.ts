/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { Table } from '../../../jscaip/TableUtils';
import { EpaminondasPositionalHeuristic } from '../EpaminondasPositionalHeuristic';
import { EpaminondasConfig, EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasState } from '../EpaminondasState';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('EpaminondasPositionalHeuristic', () => {

    let heuristic: EpaminondasPositionalHeuristic;
    const defaultConfig: MGPOptional<EpaminondasConfig> = EpaminondasRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new EpaminondasPositionalHeuristic();
    });

    it('should prefer to get near the opponent line', () => {
        const greaterBoard: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, _, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, _, O],
        ];
        const greaterState: EpaminondasState = new EpaminondasState(greaterBoard, 1);
        const lesserBoard: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, _, _],
        ];
        const lesserState: EpaminondasState = new EpaminondasState(lesserBoard, 1);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               lesserState, MGPOptional.empty(),
                                                               greaterState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

    it('should prefer to have aligned piece than higher piece', () => {
        const greaterBoard: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, _, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, _, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, _, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, _, O, O, O, O, O, O],
        ];
        const greaterState: EpaminondasState = new EpaminondasState(greaterBoard, 1);
        const lesserBoard: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, _, X, X, X, X, _, X],
            [X, X, X, X, X, X, X, _, X, X, X, X, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, X],
            [O, O, O, O, O, O, O, _, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, _, O, O, O, O, O, O],
        ];
        const lesserState: EpaminondasState = new EpaminondasState(lesserBoard, 1);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               lesserState, MGPOptional.empty(),
                                                               greaterState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

});
