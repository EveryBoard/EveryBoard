/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ReversiState } from '../ReversiState';
import { ReversiNode } from '../ReversiRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { ReversiHeuristic } from '../ReversiHeuristic';

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

