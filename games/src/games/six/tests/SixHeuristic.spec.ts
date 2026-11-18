/* eslint-disable max-lines-per-function */
import { BoardValue } from '../../../jscaip/AI/BoardValue';
import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { Coord } from '../../../jscaip/Coord';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { Table } from '../../../jscaip/TableUtils';
import { RulesUtils } from '../../../jscaip/tests/RulesUtils.spec';
import { SixHeuristic } from '../SixHeuristic';
import { SixMove } from '../SixMove';
import { SixConfig, SixNode, SixRules } from '../SixRules';
import { SixState } from '../SixState';

const O: PlayerOrNone = Player.ZERO;
const X: PlayerOrNone = Player.ONE;
const _: PlayerOrNone = PlayerOrNone.NONE;

describe('SixHeuristic', () => {

    let heuristic: SixHeuristic;
    const defaultConfig: SixConfig = SixRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new SixHeuristic();
    });

    describe('pre-victories', () => {

        it('should only count one preVictory when one coord is a forcing move for two lines', () => {
            // Given a node with two pre-victories
            const board: Table<PlayerOrNone> = [
                [_, _, X, _, _, X],
                [_, _, O, _, O, _],
                [_, _, O, O, _, _],
                [_, _, O, _, _, O],
                [_, O, O, _, O, X],
                [O, _, O, O, X, X],
            ];
            const state: SixState = SixState.ofRepresentation(board, 9);
            const move: SixMove = SixMove.ofDrop(new Coord(2, 3));
            const previousBoard: Table<PlayerOrNone> = [
                [_, _, O, _, _],
                [_, _, O, _, _],
                [_, _, O, _, _],
                [X, X, _, X, X],
                [_, _, O, _, _],
            ];
            const previousState: SixState = SixState.ofRepresentation(previousBoard, 8);
            const node: SixNode = RulesUtils.nodeWithPreviousMove(state, move, previousState);

            // When evaluation its value
            const boardValue: BoardValue = heuristic.getBoardValue(node, defaultConfig);

            // Then that value should be a pre-victory
            expect(boardValue.metrics).toEqual([BoardValue.getPreVictoryValueOf(Player.ZERO)]);
        });

        it('should know that 5 pieces aligned with two empty extension mean PRE_VICTORY', () => {
            const board: Table<PlayerOrNone> = [
                [X, X, X, X, X],
            ];
            const state: SixState = SixState.ofRepresentation(board, 2);
            const previousMove: SixMove = SixMove.ofDrop(new Coord(0, 0));
            const previousBoard: Table<PlayerOrNone> = [
                [_, X, X, X, X],
            ];
            const previousState: SixState = SixState.ofRepresentation(previousBoard, 1);
            const node: SixNode = RulesUtils.nodeWithPreviousMove(state, previousMove, previousState);
            HeuristicUtils.expectNodeToBePreVictory(
                node,
                Player.ONE,
                [heuristic],
                defaultConfig,
            );
        });

        it('should know that full-bowtie aligned with two empty extension mean PRE_VICTORY', () => {
            const board: Table<PlayerOrNone> = [
                [_, O, O, O],
                [O, O, O, X],
                [O, X, X, X],
                [O, X, X, _],

            ];
            const state: SixState = SixState.ofRepresentation(board, 2);
            const previousMove: SixMove = SixMove.ofDrop(new Coord(2, 2));
            const previousBoard: Table<PlayerOrNone> = [
                [_, O, O, O],
                [O, O, O, X],
                [O, X, _, X],
                [O, X, X, _],
            ];
            const previousState: SixState = SixState.ofRepresentation(previousBoard, 1);
            const node: SixNode = RulesUtils.nodeWithPreviousMove(state, previousMove, previousState);
            HeuristicUtils.expectNodeToBePreVictory(
                node,
                Player.ONE,
                [heuristic],
                defaultConfig,
            );
        });

    });

    describe('4 pieces aligned is better than 3 pieces aligned', () => {

        it('should be true with lines', () => {
            const move: SixMove = SixMove.ofDrop(new Coord(1, 1));
            const weakerState: SixState = SixState.ofRepresentation([
                [O, O, _, _, _],
                [X, X, X, _, _],
                [O, O, _, _, _],
            ], 7);
            const strongerState: SixState = SixState.ofRepresentation([
                [O, O, _, _, _],
                [X, X, X, X, _],
                [O, O, _, _, _],
            ], 7);
            const weakerPreviousState: SixState = SixState.ofRepresentation([
                [O, O, _, _, _],
                [X, _, X, _, _],
                [O, O, _, _, _],
            ], 6);
            const strongerPreviousState: SixState = SixState.ofRepresentation([
                [O, O, _, _, _],
                [X, _, X, X, _],
                [O, O, _, _, _],
            ], 6);
            HeuristicUtils.expectSecondNodeToBeBetterThanFirstFor(
                heuristic,
                RulesUtils.nodeWithPreviousMove(weakerState, move, weakerPreviousState),
                RulesUtils.nodeWithPreviousMove(strongerState, move, strongerPreviousState),
                Player.ONE,
                defaultConfig,
            );
        });

        it('should be true with triangle', () => {
            const move: SixMove = SixMove.ofDrop(new Coord(1, 3));
            const weakerState: SixState = SixState.ofRepresentation([
                [_, _, _],
                [X, _, _],
                [X, _, O],
                [X, O, _],
            ], 7);
            const strongerState: SixState = SixState.ofRepresentation([
                [_, _, _],
                [X, _, X],
                [X, _, O],
                [X, O, _],
            ], 7);
            const weakerPreviousState: SixState = SixState.ofRepresentation([
                [_, _, _],
                [X, _, _],
                [X, _, O],
                [X, _, _],
            ], 6);
            const strongerPreviousState: SixState = SixState.ofRepresentation([
                [_, _, _],
                [X, _, X],
                [X, _, O],
                [X, _, _],
            ], 6);
            HeuristicUtils.expectSecondNodeToBeBetterThanFirstFor(
                heuristic,
                RulesUtils.nodeWithPreviousMove(weakerState, move, weakerPreviousState),
                RulesUtils.nodeWithPreviousMove(strongerState, move, strongerPreviousState),
                Player.ONE,
                defaultConfig,
            );
        });

        it('should be true with circle', () => {
            const move: SixMove = SixMove.ofDrop(new Coord(2, 1));
            const weakerState: SixState = SixState.ofRepresentation([
                [_, X, X],
                [_, O, X],
                [_, _, _],
            ], 7);
            const strongerState: SixState = SixState.ofRepresentation([
                [_, X, X],
                [_, O, X],
                [_, X, _],
            ], 7);
            const weakerPreviousState: SixState = SixState.ofRepresentation([
                [_, X, X],
                [_, O, _],
                [_, _, _],
            ], 6);
            const strongerPreviousState: SixState = SixState.ofRepresentation([
                [_, X, X],
                [_, O, _],
                [_, X, _],
            ], 6);
            HeuristicUtils.expectSecondNodeToBeBetterThanFirstFor(
                heuristic,
                RulesUtils.nodeWithPreviousMove(weakerState, move, weakerPreviousState),
                RulesUtils.nodeWithPreviousMove(strongerState, move, strongerPreviousState),
                Player.ONE,
                defaultConfig,
            );
        });

    });

    describe('4 pieces aligned with two spaces should be better than 4 aligned with two opponents', () => {

        it('should be true with lines', () => {
            const move: SixMove = SixMove.ofDrop(new Coord(1, 1));
            const weakerState: SixState = SixState.ofRepresentation([
                [O, O, O, O, O, O],
                [O, X, X, X, X, O],
                [O, O, O, O, O, O],
            ], 7);
            const strongerState: SixState = SixState.ofRepresentation([
                [O, O, O, O, O, O],
                [_, X, X, X, X, _],
                [O, O, O, O, O, O],
            ], 7);
            const weakerPreviousState: SixState = SixState.ofRepresentation([
                [O, O, O, O, O, O],
                [O, _, X, X, X, O],
                [O, O, O, O, O, O],
            ], 6);
            const strongerPreviousState: SixState = SixState.ofRepresentation([
                [O, O, O, O, O, O],
                [_, _, X, X, X, _],
                [O, O, O, O, O, O],
            ], 6);
            HeuristicUtils.expectSecondNodeToBeBetterThanFirstFor(
                heuristic,
                RulesUtils.nodeWithPreviousMove(weakerState, move, weakerPreviousState),
                RulesUtils.nodeWithPreviousMove(strongerState, move, strongerPreviousState),
                Player.ONE,
                defaultConfig,
            );
        });

    });

    it('Score after 40th turn should be a subtraction of the number of piece', () => {
        const state: SixState = SixState.ofRepresentation([
            [X, X, X, X, O, O, O, O, O],
            [X, X, X, X, O, O, O, O, O],
        ], 40);
        const node: SixNode = SixNode.root(state);
        expect(heuristic.getBoardValue(node, defaultConfig).metrics).toEqual([2 * Player.ZERO.getScoreModifier()]);
    });

    describe('Custom Config', () => {

        it('score after N-th turn should be a subtraction of the number of piece', () => {
            // Given a board in second phase
            // and a config with shorter phase
            const state: SixState = SixState.ofRepresentation([
                [X, X, X, X, O, O, O, O, O],
                [X, X, X, X, O, O, O, O, O],
            ], 20);
            const customConfig: SixConfig = {
                ...defaultConfig,
                piecesPerPlayer: 10,
            };
            const node: SixNode = SixNode.root(state);

            // When evaluating its board value
            const boardValue: BoardValue = heuristic.getBoardValue(node, customConfig);

            // Then it should be the difference of pieces between two player
            expect(boardValue.metrics).toEqual([2 * Player.ZERO.getScoreModifier()]);
        });

    });

});
