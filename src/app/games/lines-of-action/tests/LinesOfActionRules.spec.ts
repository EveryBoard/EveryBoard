import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LinesOfActionFailure } from '../LinesOfActionFailure';
import { LinesOfActionMove } from '../LinesOfActionMove';
import { LinesOfActionNode, LinesOfActionRules } from '../LinesOfActionRules';
import { LinesOfActionMinimax } from '../LinesOfActionMinimax';
import { LinesOfActionState } from '../LinesOfActionState';
import { Table } from 'src/app/utils/ArrayUtils';

describe('LinesOfActionRules', () => {

    let rules: LinesOfActionRules;
    let minimax: LinesOfActionMinimax;
    const X: Player = Player.ZERO;
    const O: Player = Player.ONE;
    const _: Player = Player.NONE;

    beforeEach(() => {
        rules = new LinesOfActionRules(LinesOfActionState);
        minimax = new LinesOfActionMinimax(rules, 'LinesOfActionMinimax');
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(minimax.getBoardValue(rules.node).value).toEqual(0);
    });
    it('should forbid moving a piece of the opponent', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(0, 2), new Coord(2, 2)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, going down', () => {
        const expectedBoard: Table<Player> = [
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
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 0), new Coord(2, 2)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, going up', () => {
        const expectedBoard: Table<Player> = [
            [_, X, X, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, X, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, _, X, X, X, X, _],
        ];
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 7), new Coord(2, 5)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, horizontally', () => {
        const board: Table<Player> = [
            [_, X, _, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [O, _, X, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ];
        const expectedBoard: Table<Player> = [
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
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 2), new Coord(5, 2)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, diagonally', () => {
        const expectedBoard: Table<Player> = [
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
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(1, 0), new Coord(3, 2)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, diagonally from the bottom row', () => {
        const expectedBoard: Table<Player> = [
            [_, X, X, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, X, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, _, X, X, X, X, X, _],
        ];
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(1, 7), new Coord(3, 5)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should move a piece by exactly as many spaces as there are pieces on the same line, variant', () => {
        const board: Table<Player> = [
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
        const expectedBoard: Table<Player> = [
            [_, X, X, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, O, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, _, X, X, X, _],
        ];
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(0, 2), new Coord(3, 5)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should forbid to move a piece by a different number of spaces than the number of pieces on the same line', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 0), new Coord(2, 1)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(LinesOfActionFailure.INVALID_MOVE_LENGTH());
    });
    it(`should forbid to land on one of the player's pieces`, () => {
        const board: Table<Player> = [
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
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 0), new Coord(2, 2)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(RulesFailure.CANNOT_SELF_CAPTURE());
    });
    it(`should forbid to jump over an opponent's piece`, () => {
        const board: Table<Player> = [
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
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 2), new Coord(0, 2)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(LinesOfActionFailure.CANNOT_JUMP_OVER_OPPONENT());
    });
    it('should allow to jump over its own pieces', () => {
        const expectedBoard: Table<Player> = [
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
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(1, 0), new Coord(7, 0)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should capture when landing on an opponent', () => {
        const board: Table<Player> = [
            [_, X, _, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [_, _, X, _, O, _, _, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ];
        const expectedBoard: Table<Player> = [
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
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 2), new Coord(4, 2)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('should not detect win when there still are multiple groups', () => {
        const board: Table<Player> = [
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
        expect(LinesOfActionRules.getVictory(state)).toEqual(MGPOptional.empty());
    });
    it('should win when a player has only one piece', () => {
        const board: Table<Player> = [
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
        expect(LinesOfActionRules.getVictory(state)).toEqual(MGPOptional.of(Player.ONE));
        expect(minimax.getBoardValue(new LinesOfActionNode(MGPOptional.empty(), null, state)).value)
            .toBe(Player.ONE.getVictoryValue());
    });
    it(`should win when all the player's pieces are connected, in any direction`, () => {
        const board: Table<Player> = [
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
        expect(LinesOfActionRules.getVictory(state)).toEqual(MGPOptional.of(Player.ZERO));
        expect(minimax.getBoardValue(new LinesOfActionNode(MGPOptional.empty(), null, state)).value)
            .toBe(Player.ZERO.getVictoryValue());
    });
    it('should draw on simultaneous connections', () => {
        const board: Table<Player> = [
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
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(0, 2), new Coord(4, 2)).get();
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: LinesOfActionState = rules.applyLegalMove(move, state, status);
        expect(LinesOfActionRules.getVictory(resultingState)).toEqual(MGPOptional.of(Player.NONE));
    });
    it('should list all possible targets', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const targets: Coord[] = LinesOfActionRules.possibleTargets(state, new Coord(4, 7));
        expect(targets).toEqual([new Coord(4, 5), new Coord(6, 5), new Coord(2, 5)]);
    });
    it('should list only legal moves in possible targets', () => {
        const board: Table<Player> = [
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
        const targets: Coord[] = LinesOfActionRules.possibleTargets(state, new Coord(2, 2));
        expect(targets).toEqual([
            new Coord(2, 1), new Coord(3, 1),
            new Coord(3, 3), new Coord(2, 3),
            new Coord(1, 3), new Coord(1, 1),
        ]);
    });
    it('should have 36 moves on the initial state', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const node: LinesOfActionNode = new LinesOfActionNode(MGPOptional.empty(), null, state);
        expect(minimax.getListMoves(node).length).toBe(6 * 3 * 2);
    });
    it('should have 0 moves on a victory state', () => {
        const board: Table<Player> = [
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
        const node: LinesOfActionNode = new LinesOfActionNode(MGPOptional.empty(), null, state);
        expect(minimax.getListMoves(node).length).toBe(0);
    });
});
