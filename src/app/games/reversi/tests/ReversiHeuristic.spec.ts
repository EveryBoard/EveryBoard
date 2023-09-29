/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ReversiState } from '../ReversiState';
import { ReversiNode } from '../ReversiRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { ReversiHeuristic } from '../ReversiHeuristic';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;


describe('ReversiHeuristic', () => {

    let heuristic: ReversiHeuristic;

    beforeEach(() => {
        heuristic = new ReversiHeuristic();
    });
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
    it('should prefer owning the corners', () => {
        // Given two boards where we control the corner in one, and not in the other
        const weakerBoard: Table<PlayerOrNone> = [
            [_, X, O, _, _, _, _, _],
            [_, _, O, _, _, _, _, _],
            [_, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const weakerState: ReversiState = new ReversiState(weakerBoard, 2);
        const strongerBoard: Table<PlayerOrNone> = [
            [O, O, O, _, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const strongerState: ReversiState = new ReversiState(strongerBoard, 2);
        // When computing the board value
        // Then the control of the corner should be preferred
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakerState, MGPOptional.empty(),
                                                               strongerState, MGPOptional.empty(),
                                                               Player.ZERO);
    });
});
