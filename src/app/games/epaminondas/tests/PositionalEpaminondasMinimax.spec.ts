/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/utils/ArrayUtils';
import { Direction } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasNode, EpaminondasRules } from '../EpaminondasRules';
import { PhalanxSizeAndFilterEpaminondasMoveGenerator, PositionalEpaminondasHeuristic, PositionalEpaminondasMinimax } from '../PositionalEpaminondasMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { AIDepthLimitOptions } from 'src/app/jscaip/MGPNode';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('PhalanxSizeAndFilterEpaminondasMoveGenerator', () => {

    let rules: EpaminondasRules;
    let moveGenerator: PhalanxSizeAndFilterEpaminondasMoveGenerator;

    beforeEach(() => {
        rules = EpaminondasRules.get();
        moveGenerator = new PhalanxSizeAndFilterEpaminondasMoveGenerator();
    });
    it('should filter number of choices', () => {
        const node: EpaminondasNode = rules.getInitialNode();
        expect(moveGenerator.getListMoves(node).length).toBeLessThan(114);
    });
    it('should not filter number of choices if it is below 40', () => {
        // Given a board with less than 40 choice in total
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, X, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 1);
        const node: EpaminondasNode = new EpaminondasNode(state);

        // When getting the list of move
        const moves: EpaminondasMove[] = moveGenerator.getListMoves(node);

        // Then we should have all of them (8)
        expect(moves.length).toBe(8);
    });
});

describe('PositionalEpaminondasHeuristic', () => {

    let heuristic: PositionalEpaminondasHeuristic;

    beforeEach(() => {
        heuristic = new PositionalEpaminondasHeuristic();
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
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                           lesserState, MGPOptional.empty(),
                                                           greaterState, MGPOptional.empty(),
                                                           Player.ONE);
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
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                           lesserState, MGPOptional.empty(),
                                                           greaterState, MGPOptional.empty(),
                                                           Player.ONE);
    });
});

describe('PositionalEpaminondasMinimax', () => {

    let minimax: PositionalEpaminondasMinimax;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };

    beforeEach(() => {
        minimax = new PositionalEpaminondasMinimax();
    });
    it('should consider possible capture the best move', () => {
        const board: Table<PlayerOrNone> = [
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
        ];
        const state: EpaminondasState = new EpaminondasState(board, 1);
        const node: EpaminondasNode = new EpaminondasNode(state);
        const expectedMove: EpaminondasMove = new EpaminondasMove(9, 1, 4, 4, Direction.LEFT);
        const bestMove: EpaminondasMove = minimax.chooseNextMove(node, minimaxOptions);

        expect(bestMove).toEqual(expectedMove);
    });
});
