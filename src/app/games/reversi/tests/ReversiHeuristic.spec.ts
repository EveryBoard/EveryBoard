/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { ReversiLegalityInformation, ReversiNode, ReversiRules } from '../ReversiRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI';
import { ReversiHeuristic } from '../ReversiHeuristic';
import { Minimax } from 'src/app/jscaip/Minimax';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;


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
    let minimax: Minimax<ReversiMove, ReversiState, ReversiLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };

    beforeEach(() => {
        rules = ReversiRules.get();
        minimax = new Minimax('Minimax', ReversiRules.get(), new ReversiHeuristic(), new ReversiMoveGenerator());
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
