/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { PentagoFailure } from '../PentagoFailure';
import { PentagoMove } from '../PentagoMove';
import { PentagoNode, PentagoRules } from '../PentagoRules';
import { PentagoState } from '../PentagoState';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table } from 'src/app/jscaip/TableUtils';
import { MGPOptional } from '@everyboard/lib';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('PentagoRules', () => {

    let rules: PentagoRules;
    const defaultConfig: NoConfig = PentagoRules.get().getDefaultRulesConfig();
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(() => {
        rules = PentagoRules.get();
    });

    it('it should be illegal to drop piece on occupied space', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _],
            [_, O, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 1);
        const move: PentagoMove = PentagoMove.rotationless(1, 1);

        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_LAND_ON_EMPTY_SPACE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('it should prevent redundancy by refusing rotating neutral block', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _],
            [_, O, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 1);
        const move: PentagoMove = PentagoMove.withRotation(4, 1, 3, true);

        // Then the move should be illegal
        const reason: string = PentagoFailure.CANNOT_ROTATE_NEUTRAL_BLOCK();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('it should refuse rotation less move when there is no neutral block', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, O, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 3);
        const move: PentagoMove = PentagoMove.rotationless(0, 0);

        // Then the move should be illegal
        const reason: string = PentagoFailure.MUST_CHOOSE_BLOCK_TO_ROTATE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('it should allow rotation-free move when there is neutral block', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, O, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 3);
        const expectedBoard: Table<PlayerOrNone> = [
            [_, _, _, O, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const expectedState: PentagoState = new PentagoState(expectedBoard, 4);
        const move: PentagoMove = PentagoMove.rotationless(1, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('it should be able to twist any block clockwise', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, O, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 4);
        const expectedBoard: Table<PlayerOrNone> = [
            [_, _, O, O, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const expectedState: PentagoState = new PentagoState(expectedBoard, 5);
        const move: PentagoMove = PentagoMove.withRotation(0, 0, 0, true);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        const node: PentagoNode = new PentagoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        // Then it should be considered as ongoing
        RulesUtils.expectToBeOngoing(rules, node, defaultConfig);
    });

    it('it should be able to twist any board anti-clockwise', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, O, _, _],
            [X, X, _, _, _, _],
            [_, _, _, _, _, _],
            [O, X, _, X, _, _],
            [_, X, _, _, _, _],
            [_, X, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 4);
        const expectedBoard: Table<PlayerOrNone> = [
            [_, _, _, O, _, _],
            [_, X, _, _, _, _],
            [O, X, _, _, _, _],
            [O, X, _, X, _, _],
            [_, X, _, _, _, _],
            [_, X, _, _, _, _],
        ];
        const expectedState: PentagoState = new PentagoState(expectedBoard, 5);
        const move: PentagoMove = PentagoMove.withRotation(0, 0, 0, false);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        const node: PentagoNode = new PentagoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
    });

    describe('victories', () => {

        it('it should notice victory', () => {
            const board: Table<PlayerOrNone> = [
                [O, _, _, O, _, _],
                [O, X, _, _, _, _],
                [O, _, _, _, _, _],
                [_, _, _, X, _, _],
                [_, _, _, _, _, _],
                [_, O, _, _, _, _],
            ];
            const expectedBoard: Table<PlayerOrNone> = [
                [O, _, _, O, _, _],
                [O, X, _, _, _, _],
                [O, _, _, _, _, _],
                [O, _, _, X, _, _],
                [O, _, _, _, _, _],
                [_, _, _, _, _, _],
            ];
            const state: PentagoState = new PentagoState(board, 10);
            const move: PentagoMove = PentagoMove.withRotation(0, 5, 2, true);
            const expectedState: PentagoState = new PentagoState(expectedBoard, 11);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: PentagoNode = new PentagoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it('it should notice draw by end game', () => {
            const board: Table<PlayerOrNone> = [
                [O, X, O, X, O, X],
                [X, O, X, O, X, O],
                [O, X, O, X, O, X],
                [O, X, O, X, O, X],
                [X, O, X, O, X, O],
                [X, O, X, O, _, O],
            ];
            const expectedBoard: Table<PlayerOrNone> = [
                [O, X, O, X, O, X],
                [X, O, X, O, X, O],
                [O, X, O, X, O, X],
                [O, X, O, X, O, O],
                [X, O, X, O, X, X],
                [X, O, X, X, O, O],
            ];
            const state: PentagoState = new PentagoState(board, 35);
            const move: PentagoMove = PentagoMove.withRotation(4, 5, 3, false);
            const expectedState: PentagoState = new PentagoState(expectedBoard, 36);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: PentagoNode = new PentagoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
            RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        });

        it('it should notice draw by double-victory', () => {
            const board: Table<PlayerOrNone> = [
                [_, X, _, _, _, _],
                [X, _, _, _, _, _],
                [_, O, O, X, _, _],
                [O, _, _, _, X, _],
                [O, _, _, _, _, X],
                [O, _, _, _, _, _],
            ];
            const expectedBoard: Table<PlayerOrNone> = [
                [_, X, _, _, _, _],
                [O, _, X, _, _, _],
                [O, _, _, X, _, _],
                [O, _, _, _, X, _],
                [O, _, _, _, _, X],
                [O, _, _, _, _, O],
            ];
            const state: PentagoState = new PentagoState(board, 10);
            const move: PentagoMove = PentagoMove.withRotation(5, 5, 0, true);
            const expectedState: PentagoState = new PentagoState(expectedBoard, 11);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: PentagoNode = new PentagoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
            RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        });

    });

});
