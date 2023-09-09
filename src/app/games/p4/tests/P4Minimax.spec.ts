/* eslint-disable max-lines-per-function */
import { P4Minimax } from '../P4Minimax';
import { P4Move } from '../P4Move';
import { P4State, p4Config } from '../P4State';
import { P4Node, P4Rules } from '../P4Rules';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Table } from 'src/app/utils/ArrayUtils';

describe('P4Minimax', () => {

    let minimax: P4Minimax;
    let rules: P4Rules;
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(() => {
        rules = P4Rules.get();
        minimax = new P4Minimax(rules, 'P4Minimax');
    });
    it('should know when a column is full or not', () => {
        const board: Table<PlayerOrNone> = [
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, O, X, O, X, O, X],
        ];
        const state: P4State = new P4State(board, 12);
        const node: P4Node = new P4Node(state);
        expect(minimax.getListMoves(node).length).toBe(6);
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

        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ZERO);
    });
    it('First choice should be center at all AI depths', () => {
        const initialState: P4State = P4State.getInitialState(p4Config);
        for (let depth: number = 1; depth < 6; depth ++) {
            const node: P4Node = new P4Node(initialState);
            expect(node.findBestMove(depth, minimax))
                .withContext('depth ' + depth + ' should still think center is better')
                .toEqual(P4Move.of(3));
        }
    });
    it('Minimax should prune when instructed to do so', () => {
        const getBoardValueSpy: jasmine.Spy = spyOn(minimax, 'getBoardValue').and.callThrough();
        const getListMovesSpy: jasmine.Spy = spyOn(minimax, 'getListMoves').and.callThrough();

        // Given the number of moves of a minimax without alpha-beta pruning
        let node: P4Node = rules.getInitialNode();
        node.findBestMove(3, minimax, false, false);
        const callsToGetBoardValueWithoutPruning: number = getBoardValueSpy.calls.count();
        getBoardValueSpy.calls.reset();
        const callsToGetListMovesWithoutPruning: number = getListMovesSpy.calls.count();
        getListMovesSpy.calls.reset();

        // When computing the same information with alpha-beta pruning enabled
        node = new P4Node(P4State.getInitialState(p4Config));
        node.findBestMove(3, minimax, false, true);
        const callsToGetBoardValueWithPruning: number = getBoardValueSpy.calls.count();
        const callsToGetListMovesWithPruning: number = getListMovesSpy.calls.count();

        // Then the number of calls is strictly lower
        expect(callsToGetBoardValueWithPruning).toBeLessThan(callsToGetBoardValueWithoutPruning);
        expect(callsToGetListMovesWithPruning).toBeLessThan(callsToGetListMovesWithoutPruning);
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
            const boardValue: number = minimax.getBoardValue(node).value;

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
            const boardValue: number = minimax.getBoardValue(node).value;

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
            const boardValue: number = minimax.getBoardValue(node).value;

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
            const boardValue: number = minimax.getBoardValue(node).value;

            // Then the value should be -7
            expect(boardValue).toBe(-7);
        });
    });
});
