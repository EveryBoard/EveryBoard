/* eslint-disable max-lines-per-function */

import { GameNode } from '../../../jscaip/AI/GameNode';
import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { Table } from '../../../jscaip/TableUtils';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from '../EpaminondasPhalanxSizeAndFilterMoveGenerator';
import { EpaminondasPositionalHeuristic } from '../EpaminondasPositionalHeuristic';
import { EpaminondasConfig, EpaminondasNode, EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasState } from '../EpaminondasState';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('EpaminondasPositionalHeuristic', () => {

    let heuristic: EpaminondasPositionalHeuristic;
    const defaultConfig: EpaminondasConfig = EpaminondasRules.get().getDefaultRulesConfig();

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
        HeuristicUtils.expectSecondNodeToBeBetterThanFirstFor(
            heuristic,
            GameNode.root(lesserState),
            GameNode.root(greaterState),
            Player.ONE,
            defaultConfig,
        );
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
        HeuristicUtils.expectSecondNodeToBeBetterThanFirstFor(
            heuristic,
            GameNode.root(lesserState),
            GameNode.root(greaterState),
            Player.ONE,
            defaultConfig,
        );
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
        const node: EpaminondasNode = EpaminondasNode.root(state);
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
        const weakNode: EpaminondasNode = rules.choose(node, weakMove, defaultConfig).get();
        const strongNode: EpaminondasNode = rules.choose(node, strongMove, defaultConfig).get();

        HeuristicUtils.expectSecondNodeToBeBetterThanFirstFor(
            heuristic,
            weakNode,
            strongNode,
            state.getCurrentPlayer(),
            defaultConfig,
        );
    });

});
