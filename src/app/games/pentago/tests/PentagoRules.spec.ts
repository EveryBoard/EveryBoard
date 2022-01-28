/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { PentagoFailure } from '../PentagoFailure';
import { PentagoMove } from '../PentagoMove';
import { PentagoNode, PentagoRules } from '../PentagoRules';
import { PentagoState } from '../PentagoState';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';
import { PentagoMinimax } from '../PentagoMinimax';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('PentagoRules', () => {

    let rules: PentagoRules;
    let minimaxes: Minimax<PentagoMove, PentagoState>[];
    const _: Player = Player.NONE;
    const O: Player = Player.ZERO;
    const X: Player = Player.ONE;

    beforeEach(() => {
        rules = new PentagoRules(PentagoState);
        minimaxes = [
            new PentagoMinimax(rules, 'PentagoMinimax'),
        ];
    });
    it('it should be illegal to drop piece on occupied space', () => {
        const board: Table<Player> = [
            [_, _, _, _, _, _],
            [_, O, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 1);
        const move: PentagoMove = PentagoMove.rotationless(1, 1);
        RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
    });
    it('it should prevent redundancy by refusing rotating neutral block', () => {
        const board: Table<Player> = [
            [_, _, _, _, _, _],
            [_, O, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 1);
        const move: PentagoMove = PentagoMove.withRotation(4, 1, 3, true);
        RulesUtils.expectMoveFailure(rules, state, move, PentagoFailure.CANNOT_ROTATE_NEUTRAL_BLOCK());
    });
    it('it should refuse rotation less move when there is no neutral block', () => {
        const board: Table<Player> = [
            [_, _, _, O, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 3);
        const move: PentagoMove = PentagoMove.rotationless(0, 0);
        RulesUtils.expectMoveFailure(rules, state, move, PentagoFailure.MUST_CHOOSE_BLOCK_TO_ROTATE());
    });
    it('it should allow rotation-free move when there is neutral block', () => {
        const board: Table<Player> = [
            [_, _, _, O, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 3);
        const expectedBoard: Table<Player> = [
            [_, _, _, O, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const expectedState: PentagoState = new PentagoState(expectedBoard, 4);
        const move: PentagoMove = PentagoMove.rotationless(1, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('it should be able to twist any block clockwise', () => {
        const board: Table<Player> = [
            [_, _, _, O, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 4);
        const expectedBoard: Table<Player> = [
            [_, _, O, O, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const expectedState: PentagoState = new PentagoState(expectedBoard, 5);
        const move: PentagoMove = PentagoMove.withRotation(0, 0, 0, true);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const node: PentagoNode = new PentagoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeOngoing(rules, node, minimaxes);
    });
    it('it should be able to twist any board anti-clockwise', () => {
        const board: Table<Player> = [
            [_, _, _, O, _, _],
            [X, X, _, _, _, _],
            [_, _, _, _, _, _],
            [O, X, _, X, _, _],
            [_, X, _, _, _, _],
            [_, X, _, _, _, _],
        ];
        const state: PentagoState = new PentagoState(board, 4);
        const expectedBoard: Table<Player> = [
            [_, _, _, O, _, _],
            [_, X, _, _, _, _],
            [O, X, _, _, _, _],
            [O, X, _, X, _, _],
            [_, X, _, _, _, _],
            [_, X, _, _, _, _],
        ];
        const expectedState: PentagoState = new PentagoState(expectedBoard, 5);
        const move: PentagoMove = PentagoMove.withRotation(0, 0, 0, false);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const node: PentagoNode = new PentagoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    describe('victories', () => {
        it('it should notice victory', () => {
            const board: Table<Player> = [
                [O, _, _, O, _, _],
                [O, X, _, _, _, _],
                [O, _, _, _, _, _],
                [_, _, _, X, _, _],
                [_, _, _, _, _, _],
                [_, O, _, _, _, _],
            ];
            const expectedBoard: Table<Player> = [
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
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            const node: PentagoNode = new PentagoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
        it('it should notice draw by end game', () => {
            const board: Table<Player> = [
                [O, X, O, X, O, X],
                [X, O, X, O, X, O],
                [O, X, O, X, O, X],
                [O, X, O, X, O, X],
                [X, O, X, O, X, O],
                [X, O, X, O, _, O],
            ];
            const expectedBoard: Table<Player> = [
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
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            const node: PentagoNode = new PentagoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
            RulesUtils.expectToBeDraw(rules, node, minimaxes);
        });
        it('it should notice draw by double-victory', () => {
            const board: Table<Player> = [
                [_, X, _, _, _, _],
                [X, _, _, _, _, _],
                [_, O, O, X, _, _],
                [O, _, _, _, X, _],
                [O, _, _, _, _, X],
                [O, _, _, _, _, _],
            ];
            const expectedBoard: Table<Player> = [
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
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            const node: PentagoNode = new PentagoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
            RulesUtils.expectToBeDraw(rules, node, minimaxes);
        });
    });
});
