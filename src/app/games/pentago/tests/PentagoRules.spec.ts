import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { PentagoFailure } from '../PentagoFailure';
import { PentagoMove } from '../PentagoMove';
import { PentagoRules } from '../PentagoRules';
import { PentagoGameState } from '../PentagoGameState';

describe('PentagoRules', () => {

    let rules: PentagoRules;
    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    beforeEach(() => {
        rules = new PentagoRules(PentagoGameState);
    });
    it('it should be illegal to drop piece on occupied case', () => {
        const board: number[][] = [
            [_, _, _, _, _, _],
            [_, O, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoGameState = new PentagoGameState(board, 1);
        const move: PentagoMove = PentagoMove.rotationless(1, 1);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(RulesFailure.MUST_LAND_ON_EMPTY_CASE);
    });
    it('it should prevent redundancy by refusing rotating neutral block', () => {
        const board: number[][] = [
            [_, _, _, _, _, _],
            [_, O, _, _, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoGameState = new PentagoGameState(board, 1);
        const move: PentagoMove = PentagoMove.withRotation(4, 1, 3, true);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(PentagoFailure.CANNOT_ROTATE_NEUTRAL_BLOCK);
    });
    it('it should refuse rotation less move when there is no neutral block', () => {
        const board: number[][] = [
            [_, _, _, O, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoGameState = new PentagoGameState(board, 3);
        const move: PentagoMove = PentagoMove.rotationless(0, 0);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(PentagoFailure.MUST_CHOOSE_BLOCK_TO_ROTATE);
    });
    it('it should allow rotation-free move when there is neutral block', () => {
        const board: number[][] = [
            [_, _, _, O, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoGameState = new PentagoGameState(board, 3);
        const expectedBoard: number[][] = [
            [_, _, _, O, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const expectedState: PentagoGameState = new PentagoGameState(expectedBoard, 4);
        const move: PentagoMove = PentagoMove.rotationless(1, 1);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: PentagoGameState = rules.applyLegalMove(move, state, status);
        expect(resultingSlice).toEqual(expectedState);
    });
    it('it should be able to twist any block clockwise', () => {
        const board: number[][] = [
            [_, _, _, O, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const state: PentagoGameState = new PentagoGameState(board, 4);
        const expectedBoard: number[][] = [
            [_, _, O, O, _, _],
            [_, X, _, _, _, _],
            [_, _, _, _, _, _],
            [O, _, _, X, _, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
        ];
        const expectedState: PentagoGameState = new PentagoGameState(expectedBoard, 5);
        const move: PentagoMove = PentagoMove.withRotation(0, 0, 0, true);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: PentagoGameState = rules.applyLegalMove(move, state, status);
        expect(resultingSlice).toEqual(expectedState);
        const boardStatus: GameStatus = rules.getGameStatus(new MGPNode(null, move, resultingSlice));
        expect(boardStatus).toEqual(GameStatus.ONGOING, 'Game should not be over');
    });
    it('it should be able to twist any board anti-clockwise', () => {
        const board: number[][] = [
            [_, _, _, O, _, _],
            [X, X, _, _, _, _],
            [_, _, _, _, _, _],
            [O, X, _, X, _, _],
            [_, X, _, _, _, _],
            [_, X, _, _, _, _],
        ];
        const state: PentagoGameState = new PentagoGameState(board, 4);
        const expectedBoard: number[][] = [
            [_, _, _, O, _, _],
            [_, X, _, _, _, _],
            [O, X, _, _, _, _],
            [O, X, _, X, _, _],
            [_, X, _, _, _, _],
            [_, X, _, _, _, _],
        ];
        const expectedState: PentagoGameState = new PentagoGameState(expectedBoard, 5);
        const move: PentagoMove = PentagoMove.withRotation(0, 0, 0, false);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: PentagoGameState = rules.applyLegalMove(move, state, status);
        expect(resultingSlice).toEqual(expectedState);
        const boardStatus: GameStatus = rules.getGameStatus(new MGPNode(null, move, resultingSlice));
        expect(boardStatus).toEqual(GameStatus.ONE_WON, 'This should be a victory for player one');
    });
    describe('victories', () => {
        it('it should notice victory', () => {
            const board: number[][] = [
                [O, _, _, O, _, _],
                [O, X, _, _, _, _],
                [O, _, _, _, _, _],
                [_, _, _, X, _, _],
                [_, _, _, _, _, _],
                [_, O, _, _, _, _],
            ];
            const expectedBoard: number[][] = [
                [O, _, _, O, _, _],
                [O, X, _, _, _, _],
                [O, _, _, _, _, _],
                [O, _, _, X, _, _],
                [O, _, _, _, _, _],
                [_, _, _, _, _, _],
            ];
            const slice: PentagoGameState = new PentagoGameState(board, 10);
            const move: PentagoMove = PentagoMove.withRotation(0, 5, 2, true);
            const status: LegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingSlice: PentagoGameState = rules.applyLegalMove(move, slice, status);
            const expectedSlice: PentagoGameState = new PentagoGameState(expectedBoard, 11);
            expect(resultingSlice).toEqual(expectedSlice);
            const boardStatus: GameStatus = rules.getGameStatus(new MGPNode(null, move, expectedSlice));
            expect(boardStatus).toEqual(GameStatus.ZERO_WON, 'This should be a victory for player 0');
        });
        it('it should notice draw by end game', () => {
            const board: number[][] = [
                [O, X, O, X, O, X],
                [X, O, X, O, X, O],
                [O, X, O, X, O, X],
                [O, X, O, X, O, X],
                [X, O, X, O, X, O],
                [X, O, X, O, _, O],
            ];
            const expectedBoard: number[][] = [
                [O, X, O, X, O, X],
                [X, O, X, O, X, O],
                [O, X, O, X, O, X],
                [O, X, O, X, O, O],
                [X, O, X, O, X, X],
                [X, O, X, X, O, O],
            ];
            const slice: PentagoGameState = new PentagoGameState(board, 35);
            const move: PentagoMove = PentagoMove.withRotation(4, 5, 3, false);
            const status: LegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingSlice: PentagoGameState = rules.applyLegalMove(move, slice, status);
            const expectedSlice: PentagoGameState = new PentagoGameState(expectedBoard, 36);
            expect(resultingSlice).toEqual(expectedSlice);
            const boardStatus: GameStatus = rules.getGameStatus(new MGPNode(null, move, expectedSlice));
            expect(boardStatus).toEqual(GameStatus.DRAW, 'This should be a draw');
        });
        it('it should notice draw by double-victory', () => {
            const board: number[][] = [
                [_, X, _, _, _, _],
                [X, _, _, _, _, _],
                [_, O, O, X, _, _],
                [O, _, _, _, X, _],
                [O, _, _, _, _, X],
                [O, _, _, _, _, _],
            ];
            const expectedBoard: number[][] = [
                [_, X, _, _, _, _],
                [O, _, X, _, _, _],
                [O, _, _, X, _, _],
                [O, _, _, _, X, _],
                [O, _, _, _, _, X],
                [O, _, _, _, _, O],
            ];
            const slice: PentagoGameState = new PentagoGameState(board, 10);
            const move: PentagoMove = PentagoMove.withRotation(5, 5, 0, true);
            const status: LegalityStatus = rules.isLegal(move, slice);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingSlice: PentagoGameState = rules.applyLegalMove(move, slice, status);
            const expectedSlice: PentagoGameState = new PentagoGameState(expectedBoard, 11);
            expect(resultingSlice).toEqual(expectedSlice);
            const boardStatus: GameStatus = rules.getGameStatus(new MGPNode(null, move, expectedSlice));
            expect(boardStatus).toEqual(GameStatus.DRAW, 'This should be a draw');
        });
    });
});
