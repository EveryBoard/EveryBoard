/* eslint-disable max-lines-per-function */
import { P4State } from '../P4State';
import { P4Node } from '../P4Rules';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Table } from 'src/app/utils/ArrayUtils';
import { P4Heuristic } from '../P4Heuristic';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;

describe('P4Heuristic', () => {

    let heuristic: P4Heuristic;

    beforeEach(() => {
        heuristic = new P4Heuristic();
    });
    it('should assign greater score to center column', () => {
        const weakBoard: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, O],
        ];
        const weakState: P4State = new P4State(weakBoard, 0);
        const strongBoard: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const strongState: P4State = new P4State(strongBoard, 0);

        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ZERO);
    });
    it('should count three point for the corner', () => {
        // Given a board where player zero have one piece in the corner
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, O],
        ];
        const state: P4State = new P4State(board, 1);
        const node: P4Node = new P4Node(state);

        // When counting board value
        const boardValue: number = heuristic.getBoardValue(node).value;

        // Then the value should be -3
        expect(boardValue).toBe(-3);
    });
    it('should count four for the place next to the corner', () => {
        // Given a board where player zero have one piece next to the corner
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, O, _],
        ];
        const state: P4State = new P4State(board, 1);
        const node: P4Node = new P4Node(state);

        // When counting board value
        const boardValue: number = heuristic.getBoardValue(node).value;

        // Then the value should be -4
        expect(boardValue).toBe(-4);
    });
    it('should count 5 for the place next to the corner', () => {
        // Given a board where player zero have one piece next to the center
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, O, _, _],
        ];
        const state: P4State = new P4State(board, 1);
        const node: P4Node = new P4Node(state);

        // When counting board value
        const boardValue: number = heuristic.getBoardValue(node).value;

        // Then the value should be -5
        expect(boardValue).toBe(-5);
    });
    it('should count 7 for the center', () => {
        // Given a board where player zero have one piece in the center
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const state: P4State = new P4State(board, 1);
        const node: P4Node = new P4Node(state);

        // When counting board value
        const boardValue: number = heuristic.getBoardValue(node).value;

        // Then the value should be -7
        expect(boardValue).toBe(-7);
    });
});
