/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { PlayerNumberMap } from '../../../../jscaip/PlayerMap';
import { RulesFailure } from '../../../../jscaip/RulesFailure';
import { Table } from '../../../../jscaip/TableUtils';
import { RulesUtils } from '../../../../jscaip/tests/RulesUtils.spec';
import { ReversiConfig, ReversiNode } from '../../common/AbstractReversiRules';
import { ReversiFailure } from '../../common/ReversiFailure';
import { ReversiMove } from '../../common/ReversiMove';
import { ReversiState } from '../../common/ReversiState';
import { ReversiRules } from '../ReversiRules';

describe('ReversiRules', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    let rules: ReversiRules;
    let defaultConfig: ReversiConfig;

    beforeEach(() => {
        rules = ReversiRules.get();
        defaultConfig = rules.getDefaultRulesConfig();
    });

    it('should be created', () => {
        expect(rules).toBeTruthy();
        const node: ReversiNode = rules.getInitialNode(defaultConfig);
        expect(node.gameState.turn).withContext('Game should start a turn 0').toBe(0);
    });

    it('First move should be legal and change score', () => {
        // Given the initial state
        const state: ReversiState = ReversiRules.get().getInitialState(defaultConfig);

        // When doing a legal move
        const move: ReversiMove = new ReversiMove(2, 4);

        // Then the move should succeed and the score changed
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
        const node: ReversiNode = new ReversiNode(expectedState);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        expect(node.gameState.countScore()).toEqual(PlayerNumberMap.of(4, 1));
    });

    it('Passing at first turn should be illegal', () => {
        // Given the initial state
        const state: ReversiState = ReversiRules.get().getInitialState(defaultConfig);

        // When passing
        const move: ReversiMove = ReversiMove.PASS;

        // Then the move should be illegal
        const reason: string = RulesFailure.CANNOT_PASS();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should forbid non capturing move', () => {
        // Given the initial state
        const state: ReversiState = ReversiRules.get().getInitialState(defaultConfig);

        // When doing a non capturing move
        const move: ReversiMove = new ReversiMove(0, 0);

        // Then the move should be illegal
        const reason: string = ReversiFailure.NO_ELEMENT_SWITCHED();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should forbid choosing occupied space', () => {
        // Given the initial state
        const state: ReversiState = ReversiRules.get().getInitialState(defaultConfig);

        // When playing on an occupied square
        const move: ReversiMove = new ReversiMove(3, 3);

        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SPACE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
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

        // Then the move should succeed
        const expectedState: ReversiState = new ReversiState(board, 2);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
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
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: ReversiNode = new ReversiNode(expectedState, undefined, MGPOptional.of(move));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
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
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: ReversiNode = new ReversiNode(expectedState, undefined, MGPOptional.of(move));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
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
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: ReversiNode = new ReversiNode(expectedState, undefined, MGPOptional.of(move));
            RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        });

    });

    describe('alternative config', () => {

        describe('Toric Board', () => {

            const toricConfig: ReversiConfig = {
                ...defaultConfig,
                toric: true,
            };

            it('should capture piece sandwiched from across the board horizontally', () => {
                // Given a board where current player can capture on a toroidal board
                // (but could not if it was a rectangular)
                const board: Table<PlayerOrNone> = [
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, O, X, O, O, O, O, O],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                ];
                const state: ReversiState = new ReversiState(board, 1);

                // When doing a move that captures pieces across the board
                const move: ReversiMove = new ReversiMove(0, 3);

                // Then the move should succeed
                const expectedBoard: Table<PlayerOrNone> = [
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [X, X, X, X, X, X, X, X],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                ];
                const expectedState: ReversiState = new ReversiState(expectedBoard, 2);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, toricConfig);
            });

            it('should capture piece sandwiched from across the board vertically', () => {
                // Given a board where current can capture on a toroidal board (but could not if it was a rectangular)
                const board: Table<PlayerOrNone> = [
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, X, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, X, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, X, _, _, _],
                    [_, _, _, _, X, _, _, _],
                    [_, _, _, _, X, _, _, _],
                ];
                const state: ReversiState = new ReversiState(board, 2);

                // When doing a move that captures pieces across the board
                const move: ReversiMove = new ReversiMove(4, 0);

                // Then the move should succeed
                const expectedBoard: Table<PlayerOrNone> = [
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, X, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, O, _, _, _],
                ];
                const expectedState: ReversiState = new ReversiState(expectedBoard, 3);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, toricConfig);
            });

        });

    });

});
