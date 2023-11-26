/* eslint-disable max-lines-per-function */
import { ReversiNode, ReversiRules } from '../ReversiRules';
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Table } from 'src/app/utils/ArrayUtils';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ReversiFailure } from '../ReversiFailure';

describe('ReversiRules', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    let rules: ReversiRules;
    let node: ReversiNode;

    beforeEach(() => {
        rules = ReversiRules.get();
        node = rules.getInitialNode();
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(node.gameState.turn).withContext('Game should start a turn 0').toBe(0);
    });
    it('First move should be legal and change score', () => {
        // Given the initial state
        const state: ReversiState = ReversiRules.get().getInitialState();

        // When doing a legal move
        const move: ReversiMove = new ReversiMove(2, 4);

        // Then the move should be accepted and the score changed
        const expectedBoard: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, O, X, _, _, _],
            [_, _, O, O, O, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const expectedState: ReversiState = new ReversiState(expectedBoard, 1);
        node = new ReversiNode(expectedState);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        expect(node.gameState.countScore()).toEqual([4, 1]);
    });
    it('Passing at first turn should be illegal', () => {
        // Given the initial state
        const state: ReversiState = ReversiRules.get().getInitialState();

        // When passing
        const move: ReversiMove = ReversiMove.PASS;

        // Then the move should be refused
        const reason: string = RulesFailure.CANNOT_PASS();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should forbid non capturing move', () => {
        // Given the initial state
        const state: ReversiState = ReversiRules.get().getInitialState();

        // When doing a non capturing move
        const move: ReversiMove = new ReversiMove(0, 0);

        // Then the move should be refused
        const reason: string = ReversiFailure.NO_ELEMENT_SWITCHED();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should forbid choosing occupied space', () => {
        // Given the initial state
        const state: ReversiState = ReversiRules.get().getInitialState();

        // When playing on an occupied square
        const move: ReversiMove = new ReversiMove(3, 3);

        // Then the move should be refused
        const reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SPACE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should allow player to pass when no other moves are possible', () => {
        // Given a board where current player must pass
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

        // When passing
        const move: ReversiMove = ReversiMove.PASS;

        // Then it should be legal
        const expectedState: ReversiState = new ReversiState(board, 2);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    describe('Endgames', () => {
        it('should consider the player with the more point the winner at the end', () => {
            const board: Table<PlayerOrNone> = [
                [O, X, X, X, X, X, X, O],
                [O, X, X, O, O, X, X, O],
                [O, X, O, X, X, X, X, O],
                [O, X, X, X, X, X, X, O],
                [O, X, X, X, O, O, X, O],
                [O, X, X, O, O, O, X, O],
                [O, O, O, O, O, O, O, O],
                [_, O, O, O, O, O, X, O],
            ];
            const expectedBoard: Table<PlayerOrNone> = [
                [O, X, X, X, X, X, X, O],
                [O, X, X, O, O, X, X, O],
                [O, X, O, X, X, X, X, O],
                [O, X, X, X, X, X, X, O],
                [O, X, X, X, O, O, X, O],
                [O, X, X, O, O, O, X, O],
                [O, X, O, O, O, O, O, O],
                [X, X, X, X, X, X, X, O],
            ];
            const state: ReversiState = new ReversiState(board, 59);
            const move: ReversiMove = new ReversiMove(0, 7);
            const expectedState: ReversiState = new ReversiState(expectedBoard, 60);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            const node: ReversiNode = new ReversiNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE);
        });
        it('should consider the player with the more point the winner at the end (Player.ZERO remix)', () => {
            const board: Table<PlayerOrNone> = [
                [X, O, O, O, O, O, O, X],
                [X, O, O, X, X, O, O, X],
                [X, O, X, O, O, O, O, X],
                [X, O, O, O, O, O, O, X],
                [X, O, O, O, X, X, O, X],
                [X, O, O, X, X, X, O, X],
                [X, X, X, X, X, X, X, X],
                [_, X, X, X, X, X, O, X],
            ];
            const expectedBoard: Table<PlayerOrNone> = [
                [X, O, O, O, O, O, O, X],
                [X, O, O, X, X, O, O, X],
                [X, O, X, O, O, O, O, X],
                [X, O, O, O, O, O, O, X],
                [X, O, O, O, X, X, O, X],
                [X, O, O, X, X, X, O, X],
                [X, O, X, X, X, X, X, X],
                [O, O, O, O, O, O, O, X],
            ];
            const state: ReversiState = new ReversiState(board, 60);
            const move: ReversiMove = new ReversiMove(0, 7);
            const expectedState: ReversiState = new ReversiState(expectedBoard, 61);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            const node: ReversiNode = new ReversiNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO);
        });
        it('should recognize draws', () => {
            const board: Table<PlayerOrNone> = [
                [O, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [_, O, O, O, X, X, X, X],
            ];
            const expectedBoard: Table<PlayerOrNone> = [
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
            ];
            const state: ReversiState = new ReversiState(board, 60);
            const move: ReversiMove = new ReversiMove(0, 7);
            const expectedState: ReversiState = new ReversiState(expectedBoard, 61);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            const node: ReversiNode = new ReversiNode(expectedState,
                                                      MGPOptional.empty(),
                                                      MGPOptional.of(move));
            RulesUtils.expectToBeDraw(rules, node);
        });
    });
});
