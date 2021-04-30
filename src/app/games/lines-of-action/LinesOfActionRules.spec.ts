import { Coord } from 'src/app/jscaip/coord/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionFailure, LinesOfActionNode, LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionState } from './LinesOfActionState';

describe('LinesOfActionRules', () => {
    const rules: LinesOfActionRules = new LinesOfActionRules(LinesOfActionState);
    const X: number = Player.ZERO.value;
    const O: number = Player.ONE.value;
    const _: number = Player.NONE.value;

    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.getBoardValue(rules.node.move, rules.node.gamePartSlice)).toEqual(0);
    });
    it('should forbid moving a piece of the opponent', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialSlice();
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(0, 2), new Coord(2, 2));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeFalse();
        expect(status.legal.getReason()).toBe(LinesOfActionFailure.NOT_YOUR_PIECE);
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, going down', () => {
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
        const state: LinesOfActionState = LinesOfActionState.getInitialSlice();
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(2, 0), new Coord(2, 2));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, going up', () => {
        const expectedBoard: number[][] = [
            [_, X, X, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, X, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, _, X, X, X, X, _],
        ];
        const state: LinesOfActionState = LinesOfActionState.getInitialSlice();
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(2, 7), new Coord(2, 5));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
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
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
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
        const state: LinesOfActionState = LinesOfActionState.getInitialSlice();
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(1, 0), new Coord(3, 2));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, diagonally from the bottom row', () => {
        const expectedBoard: number[][] = [
            [_, X, X, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, X, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, _, X, X, X, X, X, _],
        ];
        const state: LinesOfActionState = LinesOfActionState.getInitialSlice();
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(1, 7), new Coord(3, 5));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, variant', () => {
        const board: number[][] = [
            [_, X, X, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, X, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, _, X, X, X, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 1);
        const expectedBoard: number[][] = [
            [_, X, X, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, O, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, _, X, X, X, _],
        ];
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(0, 2), new Coord(3, 5));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should forbid to move a piece by a different number of spaces than the number of pieces on the same line', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialSlice();
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(2, 0), new Coord(2, 1));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeFalse();
        expect(status.legal.getReason()).toBe(LinesOfActionFailure.INVALID_MOVE_LENGTH);
    });
    it('should forbid to land on one of the player\'s pieces', () => {
        const board: number[][] = [
            [_, _, X, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [_, _, X, _, _, _, _, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, _, X, X, X, X, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(2, 0), new Coord(2, 2));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeFalse();
        expect(status.legal.getReason()).toBe(LinesOfActionFailure.BUSY_TARGET);
    });
    it('should forbid to jump over an enemy\'s piece', () => {
        const board: number[][] = [
            [_, X, _, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [_, O, X, _, _, _, _, _],
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
        const state: LinesOfActionState = LinesOfActionState.getInitialSlice();
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(1, 0), new Coord(7, 0));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
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
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should not detect win when there still are multiple groups', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X],
            [_, _, O, _, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        expect(rules.getVictory(state)).toEqual(MGPOptional.empty());
    });
    it('should win when a player has only one piece', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X],
            [_, _, O, _, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        expect(rules.getVictory(state)).toEqual(MGPOptional.of(Player.ONE));
        expect(rules.getBoardValue(undefined, state)).toBe(Player.ONE.getVictoryValue());
    });
    it('should win when all the player\'s pieces are connected, in any direction', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [O, _, _, _, X, _, _, O],
            [_, _, X, X, O, _, _, _],
            [_, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        expect(rules.getVictory(state)).toEqual(MGPOptional.of(Player.ZERO));
        expect(rules.getBoardValue(undefined, state)).toBe(Player.ZERO.getVictoryValue());
    });
    it('should draw on simultaneous connections', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [X, _, _, X, O, X, _, _],
            [_, _, _, X, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const move: LinesOfActionMove = new LinesOfActionMove(new Coord(0, 2), new Coord(4, 2));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(rules.getVictory(resultingState)).toEqual(MGPOptional.of(Player.NONE));
    });
    it('should list all possible targets', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialSlice();
        const targets: Coord[] = rules.possibleTargets(state, new Coord(4, 7));
        expect(targets).toEqual([new Coord(4, 5), new Coord(6, 5), new Coord(2, 5)]);
    });
    it('should list only legal moves in possible targets', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [X, _, X, _, O, _, _, _],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const targets: Coord[] = rules.possibleTargets(state, new Coord(2, 2));
        expect(targets).toEqual([
            new Coord(2, 1), new Coord(3, 1),
            new Coord(3, 3), new Coord(2, 3),
            new Coord(1, 3), new Coord(1, 1),
        ]);
    });
    it('should have 36 moves on the initial slice', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialSlice();
        const node: LinesOfActionNode = new LinesOfActionNode(null, null, state, 0);
        expect(rules.getListMoves(node).size()).toBe(6 * 3 * 2);
    });
    it('should have 0 moves on a victory slice', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [O, _, _, _, X, _, _, O],
            [_, _, X, X, O, _, _, _],
            [_, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const node: LinesOfActionNode = new LinesOfActionNode(null, null, state, 0);
        expect(rules.getListMoves(node).size()).toBe(0);
    });
});
