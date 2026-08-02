/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { BoardValue } from '../../../jscaip/AI/BoardValue';
import { HeuristicBounds } from '../../../jscaip/AI/Minimax';
import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { Table } from '../../../jscaip/TableUtils';
import { P4Heuristic } from '../P4Heuristic';
import { P4Config, P4Node, P4Rules } from '../P4Rules';
import { P4State } from '../P4State';


const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;

describe('P4Heuristic', () => {

    let heuristic: P4Heuristic;
    const defaultConfig: P4Config = P4Rules.get().getDefaultRulesConfig();

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
                                                               Player.ZERO,
                                                               defaultConfig);
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
        const boardValue: readonly number[] = heuristic.getBoardValue(node, defaultConfig).metrics;

        // Then the value should be -3
        expect(boardValue).toEqual([-3]);
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
        const boardValue: readonly number[] = heuristic.getBoardValue(node, defaultConfig).metrics;

        // Then the value should be -4
        expect(boardValue).toEqual([-4]);
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
        const boardValue: readonly number[] = heuristic.getBoardValue(node, defaultConfig).metrics;

        // Then the value should be -5
        expect(boardValue).toEqual([-5]);
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
        const boardValue: readonly number[] = heuristic.getBoardValue(node, defaultConfig).metrics;

        // Then the value should be -7
        expect(boardValue).toEqual([-7]);
    });

    it('should compute the right bounds for the default config', () => {
        // Given the default config
        // When computing the bounds
        const bounds: HeuristicBounds<BoardValue> = heuristic.getBounds(defaultConfig);
        // Then it should 2 * the number of squares
        const expectedHeuristicValue: number = 2 * defaultConfig.width * defaultConfig.height;
        const expectedBounds: HeuristicBounds<BoardValue> = {
            player0Best: BoardValue.ofSingle(expectedHeuristicValue, 0),
            player1Best: BoardValue.ofSingle(0, expectedHeuristicValue),
        };
        expect(bounds).toEqual(expectedBounds);
    });

});
