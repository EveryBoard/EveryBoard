import { Coord } from 'src/app/jscaip/coord/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/player/Player';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionFailure, LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionState } from './LinesOfActionState';

describe('LinesOfActionRules', () => {
    const rules: LinesOfActionRules = new LinesOfActionRules(LinesOfActionState);
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;
    const _: number = Player.NONE.value;

    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.getBoardValue(rules.node.move, rules.node.gamePartSlice)).toEqual(0);
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, vertically', () => {
        const expectedBoard: number[][] = [
            [_, X, _, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [O, _, X, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ];
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(2, 0), new Coord(2, 2));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status).resultingSlice;
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, horizontally', () => {
        const board: number[][] = [
            [_, X, _, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [O, _, X, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ];
        const expectedBoard: number[][] = [
            [_, X, _, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, X, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(2, 2), new Coord(5, 2));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status).resultingSlice;
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, diagonally', () => {
        const expectedBoard: number[][] = [
            [_, _, X, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, X, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ];
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(1, 0), new Coord(3, 2));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status).resultingSlice;
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should forbit to move a piece by a different number of spaces than the number of pieces on the same line', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(2, 0), new Coord(2, 1));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeFalse();
        expect(status.legal.getReason()).toBe(LinesOfActionFailure.INVALID_MOVE_LENGTH);
    });
    it('should forbid to jump over an enemy\'s piece', () => {
        const board: number[][] = [
            [_, X, _, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [_, O, X, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(2, 2), new Coord(0, 2));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeFalse();
        expect(status.legal.getReason()).toBe(LinesOfActionFailure.CANNOT_JUMP_OVER_ENEMY);
    });
    it('should allow to jump over its own pieces', () => {
        const expectedBoard: number[][] = [
            [_, _, X, X, X, X, X, X],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ];
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(1, 0), new Coord(7, 0));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status).resultingSlice;
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should capture when landing on an enemy', () => {
        const board: number[][] = [
            [_, X, _, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [_, _, X, _, O, _, _, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ];
        const expectedBoard: number[][] = [
            [_, X, _, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [_, _, _, _, X, _, _, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(2, 2), new Coord(4, 2));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status).resultingSlice;
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should win when a player has only one piece', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, O],
            [_, _, X, _, O, _, _, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        expect(rules.isVictory(state)).toBeTrue();
    });
    it('should win when all the player\'s pieces are connected, in any direction', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [O, _, _, _, X, _, _, O],
            [_, _, X, X, O, _, _, _],
            [O, _, _, X, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        expect(rules.isVictory(state)).toBeTrue();
    });
    it('should draw on simultaneous connections', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, X, X, O, X, _, _],
            [_, _, _, X, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(2, 2), new Coord(4, 2));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status).resultingSlice;
        expect(rules.isDraw(resultingState)).toBeTrue();
    });
});
