/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ReversiHeuristic, ReversiMinimax, ReversiMoveGenerator } from '../ReversiMinimax';
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { ReversiNode, ReversiRules } from '../ReversiRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { AIDepthLimitOptions } from 'src/app/jscaip/MGPNode';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('ReversiMoveGenerator', () => {

    let rules: ReversiRules;
    let moveGenerator: ReversiMoveGenerator;

    beforeEach(() => {
        rules = ReversiRules.get();
        moveGenerator = new ReversiMoveGenerator();
    });
    it('should have 4 choices at first turn', () => {
        const node: ReversiNode = rules.getInitialNode();
        const moves: ReversiMove[] = moveGenerator.getListMoves(node);
        expect(moves.length).toBe(4);
    });
    it('should propose passing move when no other moves are possible', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, O, _, _, _],
        ];
        const state: ReversiState = new ReversiState(board, 1);
        const node: ReversiNode = new ReversiNode(state);
        const moves: ReversiMove[] = moveGenerator.getListMoves(node);
        expect(moves.length).toBe(1);
        expect(moves[0]).toBe(ReversiMove.PASS);
    });
});

describe('ReversiHeuristic', () => {

    let heuristic: ReversiHeuristic;

    beforeEach(() => {
        heuristic = new ReversiHeuristic();
    });
    describe('getBoardValue', () => {
        it('should get 16 points for corner', () => {
            const board: Table<PlayerOrNone> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, X, O, _, _, _],
                [_, _, _, O, X, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, X],
            ];
            const state: ReversiState = new ReversiState(board, 1);
            const node: ReversiNode = new ReversiNode(state);
            const boardValue: number = heuristic.getBoardValue(node).value;
            expect(boardValue).toBe(16);
        });
        it('should get 4 points for edges', () => {
            const board: Table<PlayerOrNone> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, X, O, _, _, _],
                [_, _, _, O, X, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, _],
            ];
            const state: ReversiState = new ReversiState(board, 1);
            const node: ReversiNode = new ReversiNode(state);
            const boardValue: number = heuristic.getBoardValue(node).value;
            expect(boardValue).toBe(4);
        });
        it('should get 1 points for normal square', () => {
            const board: Table<PlayerOrNone> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, X, O, _, _, _],
                [_, _, _, O, X, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, _],
                [_, _, _, _, _, _, _, _],
            ];
            const state: ReversiState = new ReversiState(board, 1);
            const node: ReversiNode = new ReversiNode(state);
            const boardValue: number = heuristic.getBoardValue(node).value;
            expect(boardValue).toBe(1);
        });
    });
});


describe('ReversiMinimax', () => {

    let rules: ReversiRules;
    let minimax: ReversiMinimax;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };

    beforeEach(() => {
        rules = ReversiRules.get();
        minimax = new ReversiMinimax();
    });
    it('should not throw at first choice', () => {
        const node: ReversiNode = rules.getInitialNode();
        const bestMove: ReversiMove = minimax.chooseNextMove(node, minimaxOptions);
        expect(rules.isLegal(bestMove, ReversiState.getInitialState()).isSuccess()).toBeTrue();
    });
    it('should prioritize taking control of the corners', () => {
        const board: Table<PlayerOrNone> = [
            [_, X, O, _, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: ReversiState = new ReversiState(board, 2);
        const node: ReversiNode = new ReversiNode(state);
        const bestMove: ReversiMove = minimax.chooseNextMove(node, minimaxOptions);
        expect(bestMove.equals(new ReversiMove(0, 0))).toBeTrue();
    });
});
