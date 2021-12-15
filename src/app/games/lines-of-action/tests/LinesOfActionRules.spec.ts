import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LinesOfActionFailure } from '../LinesOfActionFailure';
import { LinesOfActionMove } from '../LinesOfActionMove';
import { LinesOfActionNode, LinesOfActionRules } from '../LinesOfActionRules';
import { LinesOfActionMinimax } from '../LinesOfActionMinimax';
import { LinesOfActionState } from '../LinesOfActionState';
import { Table } from 'src/app/utils/ArrayUtils';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';

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
    });
    it('should forbid moving a piece of the opponent', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(0, 2), new Coord(2, 2)).get();
        RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
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
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
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
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
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
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
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
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
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
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
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
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 2);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should forbid to move a piece by a different number of spaces than the number of pieces on the same line', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 0), new Coord(2, 1)).get();
        RulesUtils.expectMoveFailure(rules, state, move, LinesOfActionFailure.INVALID_MOVE_LENGTH());
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
        RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.CANNOT_SELF_CAPTURE());
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
        RulesUtils.expectMoveFailure(rules, state, move, LinesOfActionFailure.CANNOT_JUMP_OVER_OPPONENT());
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
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
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
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
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
        const node: LinesOfActionNode = new LinesOfActionNode(state);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, [minimax]);
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
        const node: LinesOfActionNode = new LinesOfActionNode(state);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, [minimax]);
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
        const expectedBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, X, X, X, _, _],
            [_, _, _, X, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, _],
        ];
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const node: LinesOfActionNode = new LinesOfActionNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeOngoing(rules, node, [minimax]);
        expect(LinesOfActionRules.getVictory(expectedState)).toEqual(MGPOptional.of(Player.NONE));
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
        const node: LinesOfActionNode = new LinesOfActionNode(state);
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
        const node: LinesOfActionNode = new LinesOfActionNode(state);
        expect(minimax.getListMoves(node).length).toBe(0);
    });
});
