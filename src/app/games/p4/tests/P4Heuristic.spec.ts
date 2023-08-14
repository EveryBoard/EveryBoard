/* eslint-disable max-lines-per-function */
import { P4Move } from '../P4Move';
import { P4State } from '../P4State';
import { P4Node, P4Rules } from '../P4Rules';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Table } from 'src/app/utils/ArrayUtils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { P4Heuristic } from '../P4Heuristic';
import { P4MoveGenerator } from '../P4MoveGenerator';

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
    describe('getBoardValue', () => {
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
});

describe('P4Minimax', () => {

    let minimax: Minimax<P4Move, P4State>;

    beforeEach(() => {
        minimax = new Minimax('Minimax', P4Rules.get(), new P4Heuristic(), new P4MoveGenerator());
    });
    it('First choice should be center at all AI depths', () => {
        const initialState: P4State = P4State.getInitialState();
        for (let depth: number = 1; depth < 6; depth ++) {
            const node: P4Node = new P4Node(initialState);
            expect(minimax.chooseNextMove(node, { name: `Level ${depth}`, maxDepth: depth }))
                .withContext('depth ' + depth + ' should still think center is better')
                .toEqual(P4Move.THREE);
        }
    });
});
