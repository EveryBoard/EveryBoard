import { SiamNode, SiamRules } from '../SiamRules';
import { SiamMinimax } from '../SiamMinimax';
import { SiamMove } from '../SiamMove';
import { SiamPiece } from '../SiamPiece';
import { SiamState } from '../SiamState';
import { SiamLegalityStatus } from '../SiamLegalityStatus';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { SiamFailure } from '../SiamFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';

describe('SiamRules:', () => {

    let rules: SiamRules;

    let minimaxes: Minimax<SiamMove, SiamState, SiamLegalityStatus>[];

    const _: SiamPiece = SiamPiece.EMPTY;
    const M: SiamPiece = SiamPiece.MOUNTAIN;

    const U: SiamPiece = SiamPiece.WHITE_UP;
    const L: SiamPiece = SiamPiece.WHITE_LEFT;
    const R: SiamPiece = SiamPiece.WHITE_RIGHT;
    const D: SiamPiece = SiamPiece.WHITE_DOWN;

    const u: SiamPiece = SiamPiece.BLACK_UP;
    const l: SiamPiece = SiamPiece.BLACK_LEFT;
    const r: SiamPiece = SiamPiece.BLACK_RIGHT;
    const d: SiamPiece = SiamPiece.BLACK_DOWN;

    beforeEach(() => {
        rules = new SiamRules(SiamState);
        minimaxes = [
            new SiamMinimax(rules, 'SiamMinimax'),
        ];
    });
    it('Should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gameState.turn).withContext('Game should start a turn 0').toBe(0);
    });
    it('Insertion should work', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [R, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(-1, 4, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: SiamState = rules.applyLegalMove(move, state, status);
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
    });
    it('Simple forwarding should work', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, U, _, _],
        ];
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, U, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(2, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: SiamState = rules.applyLegalMove(move, state, status);
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
    });
    it('Should forbid moving opponent pieces', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, u, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(2, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    });
    it('Side pushing should work', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [r, _, _, _, _],
            [U, _, _, _, _],
        ];
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [r, M, M, M, _],
            [U, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: SiamState = rules.applyLegalMove(move, state, status);
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
    });
    it('Rotation should work', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [U, _, _, _, _],
        ];
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [R, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.empty(), Orthogonal.RIGHT);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: SiamState = rules.applyLegalMove(move, state, status);
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
    });
    it('Half turn rotation should work', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [U, _, _, _, _],
        ];
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [D, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.empty(), Orthogonal.DOWN);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: SiamState = rules.applyLegalMove(move, state, status);
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
    });
    it('Rotation should work while forwarding', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [U, _, _, _, _],
        ];
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [D, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.DOWN);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: SiamState = rules.applyLegalMove(move, state, status);
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
    });
    it('Should recognize fake-rotations', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, U, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(2, 4, MGPOptional.empty(), Orthogonal.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(SiamFailure.ILLEGAL_ROTATION());
    });
    it('Moving in a direction different from the piece should be legal', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [U, _, _, _, _],
        ];
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, L, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.LEFT);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: SiamState = rules.applyLegalMove(move, state, status);
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
    });
    it('One vs one push should not work', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [d, _, _, _, _],
            [U, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(SiamFailure.NOT_ENOUGH_FORCE_TO_PUSH());
    });
    it('One vs one push should not work even if one of the involved is at the border', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [D, _, _, _, _],
            [u, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, 3, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(SiamFailure.NOT_ENOUGH_FORCE_TO_PUSH());
    });
    it('Two vs one push should work', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [d, M, M, M, _],
            [U, _, _, _, _],
            [U, _, _, _, _],
        ];
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [d, _, _, _, _],
            [U, M, M, M, _],
            [U, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: SiamState = rules.applyLegalMove(move, state, status);
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
    });
    it('Two vs one should not work on this configuration', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [U, M, M, M, _],
            [d, _, _, _, _],
            [U, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(SiamFailure.NOT_ENOUGH_FORCE_TO_PUSH());
    });
    it('Pushing while changing direction should be impossible', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [l, _, _, _, _],
            [U, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.LEFT);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(SiamFailure.ILLEGAL_PUSH());
    });
    it('6 insertions should be impossible', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [U, U, U, U, U],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(SiamFailure.NO_REMAINING_PIECE_TO_INSERT());
    });
    it('Pushing several mountains should be illegal', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [R, M, M, _, _],
            [_, _, _, M, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, 2, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(SiamFailure.NOT_ENOUGH_FORCE_TO_PUSH());
    });
    it('Two pusher can push two mountain', () => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [R, R, M, M, _],
            [_, _, _, M, _],
            [_, _, _, _, _],
        ];
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, R, R, M, M],
            [_, _, _, M, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(0, 2, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: SiamState = rules.applyLegalMove(move, state, status);
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
    });
    it('Player 0 pushing player 0 pushing mountain should be a victory for player 0', () => {
        const board: Table<SiamPiece> = [
            [_, _, M, _, _],
            [_, _, U, _, _],
            [_, M, U, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedBoard: Table<SiamPiece> = [
            [_, _, U, _, _],
            [_, _, U, _, _],
            [_, M, _, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: SiamState = rules.applyLegalMove(move, state, status);
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
        const node: SiamNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('Player 1 pushing player 0 pushing mountain should be a victory for player 0', () => {
        const board: Table<SiamPiece> = [
            [_, _, M, _, _],
            [_, _, u, _, _],
            [_, M, U, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedBoard: Table<SiamPiece> = [
            [_, _, u, _, _],
            [_, _, U, _, _],
            [_, M, _, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: SiamState = rules.applyLegalMove(move, state, status);
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
        const node: SiamNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('Player 0 pushing player 1 on his side pushing mountain should be a victory for player 0', () => {
        const board: Table<SiamPiece> = [
            [_, _, M, _, _],
            [_, _, l, _, _],
            [_, M, R, M, _],
            [_, _, R, _, _],
            [_, _, R, _, _],
        ];
        const expectedBoard: Table<SiamPiece> = [
            [_, _, l, _, _],
            [_, _, R, _, _],
            [_, M, R, M, _],
            [_, _, R, _, _],
            [_, _, U, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = new SiamMove(2, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: SiamState = rules.applyLegalMove(move, state, status);
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
        const node: SiamNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
});
