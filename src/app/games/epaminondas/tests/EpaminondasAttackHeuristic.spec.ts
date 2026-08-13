/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { Table } from '../../../jscaip/TableUtils';
import { EpaminondasAttackHeuristic } from '../EpaminondasAttackHeuristic';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from '../EpaminondasPhalanxSizeAndFilterMoveGenerator';
import { EpaminondasConfig, EpaminondasNode, EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasState } from '../EpaminondasState';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('EpaminondasAttackHeuristic', () => {

    let heuristic: EpaminondasAttackHeuristic;
    const defaultConfig: EpaminondasConfig = EpaminondasRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new EpaminondasAttackHeuristic();
    });

    it('should go forward', () => {
        const weakerBoard: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, O, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, O, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, _, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, _, O],
        ];
        const weakerState: EpaminondasState = new EpaminondasState(weakerBoard, 1);
        const strongerBoard: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, O, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, O, _, _],
            [_, _, _, _, _, _, _, _, _, _, O, O, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, _, _, O],
            [O, O, O, O, O, O, O, O, O, O, O, _, O, _],
        ];
        const strongerState: EpaminondasState = new EpaminondasState(strongerBoard, 1);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakerState, MGPOptional.empty(),
                                                               strongerState, MGPOptional.empty(),
                                                               Player.ZERO,
                                                               defaultConfig);
    });

    it('should prefer going into the winning territory', () => {
        const strongerBoard: Table<PlayerOrNone> = [
            [_, O, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _, _, _, _, _, _, _],
            [_, X, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const strongerState: EpaminondasState = new EpaminondasState(strongerBoard, 1);
        const weakerBoard: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, O, O, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _, _, _, _, _, _, _],
            [_, X, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const weakerState: EpaminondasState = new EpaminondasState(weakerBoard, 1);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               strongerState, MGPOptional.empty(),
                                                               weakerState, MGPOptional.empty(),
                                                               Player.ONE,
                                                               defaultConfig);
    });

    it('should prefer capture outcomes over quiet moves', () => {
        const rules: EpaminondasRules = EpaminondasRules.get();
        const state: EpaminondasState = new EpaminondasState([
            [X, X, X, X, X, X, X, X, _, _, _, _, _, _],
            [_, O, O, _, _, _, X, X, X, X, _, _, _, _],
            [_, _, O, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], 1);
        const node: EpaminondasNode = new EpaminondasNode(state);
        const generator: EpaminondasPhalanxSizeAndFilterMoveGenerator =
            new EpaminondasPhalanxSizeAndFilterMoveGenerator();
        const moves: EpaminondasMove[] = generator.getListMoves(node, defaultConfig);
        const strongMove: EpaminondasMove = moves.find((move: EpaminondasMove) => {
            return rules.choose(node, move, defaultConfig).get().gameState.countPieceOnBoard(Player.ZERO) <
                   state.countPieceOnBoard(Player.ZERO);
        })!;
        const weakMove: EpaminondasMove = moves.find((move: EpaminondasMove) => {
            return move.equals(strongMove) === false &&
                   rules.choose(node, move, defaultConfig).get().gameState.countPieceOnBoard(Player.ZERO) ===
                   state.countPieceOnBoard(Player.ZERO);
        })!;
        const weakState: EpaminondasState = rules.choose(node, weakMove, defaultConfig).get().gameState;
        const strongState: EpaminondasState = rules.choose(node, strongMove, defaultConfig).get().gameState;

        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.of(weakMove),
                                                               strongState, MGPOptional.of(strongMove),
                                                               state.getCurrentPlayer(),
                                                               defaultConfig);
    });

});
