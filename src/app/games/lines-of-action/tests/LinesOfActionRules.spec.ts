/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPOptional, Set } from '@everyboard/lib';
import { LinesOfActionFailure } from '../LinesOfActionFailure';
import { LinesOfActionMove } from '../LinesOfActionMove';
import { LinesOfActionNode, LinesOfActionRules } from '../LinesOfActionRules';
import { LinesOfActionState } from '../LinesOfActionState';
import { Table } from 'src/app/jscaip/TableUtils';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { CoordSet } from 'src/app/jscaip/CoordSet';

describe('LinesOfActionRules', () => {

    let rules: LinesOfActionRules;
    const defaultConfig: NoConfig = LinesOfActionRules.get().getDefaultRulesConfig();
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(() => {
        rules = LinesOfActionRules.get();
    });

    it('should be created', () => {
        expect(rules).toBeTruthy();
    });

    it('should forbid moving an empty piece', () => {
        const state: LinesOfActionState = LinesOfActionRules.get().getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(3, 2), new Coord(2, 2)).get();

        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should forbid moving a piece of the opponent', () => {
        const state: LinesOfActionState = LinesOfActionRules.get().getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(0, 2), new Coord(2, 2)).get();

        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should move a piece by exactly as many spaces as there are pieces on the same line, going down', () => {
        const expectedBoard: Table<PlayerOrNone> = [
            [_, O, _, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [X, _, O, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, O, O, O, O, _],
        ];
        const state: LinesOfActionState = LinesOfActionRules.get().getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(2, 0), new Coord(2, 2)).get();
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should move a piece by exactly as many spaces as there are pieces on the same line, going up', () => {
        const expectedBoard: Table<PlayerOrNone> = [
            [_, O, O, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, O, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, _, O, O, O, O, _],
        ];
        const state: LinesOfActionState = LinesOfActionRules.get().getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(2, 7), new Coord(2, 5)).get();
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should move a piece by exactly as many spaces as there are pieces on the same line, horizontally', () => {
        const board: Table<PlayerOrNone> = [
            [_, O, _, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [X, _, O, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, O, O, O, O, _],
        ];
        const expectedBoard: Table<PlayerOrNone> = [
            [_, O, _, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, O, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, O, O, O, O, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(2, 2), new Coord(5, 2)).get();
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should move a piece by exactly as many spaces as there are pieces on the same line, diagonally', () => {
        const expectedBoard: Table<PlayerOrNone> = [
            [_, _, O, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [X, _, _, O, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, O, O, O, O, _],
        ];
        const state: LinesOfActionState = LinesOfActionRules.get().getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(1, 0), new Coord(3, 2)).get();
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should move a piece by exactly as many spaces as there are pieces on the same line, diagonally from the bottom row', () => {
        const expectedBoard: Table<PlayerOrNone> = [
            [_, O, O, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, O, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, _, O, O, O, O, O, _],
        ];
        const state: LinesOfActionState = LinesOfActionRules.get().getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(1, 7), new Coord(3, 5)).get();
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should move a piece by exactly as many spaces as there are pieces on the same line, variant', () => {
        const board: Table<PlayerOrNone> = [
            [_, O, O, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, O, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, _, O, O, O, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 1);
        const expectedBoard: Table<PlayerOrNone> = [
            [_, O, O, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, X, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, _, O, O, O, _],
        ];
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(0, 2), new Coord(3, 5)).get();
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 2);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should forbid to move a piece by a different number of spaces than the number of pieces on the same line', () => {
        const state: LinesOfActionState = LinesOfActionRules.get().getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(2, 0), new Coord(2, 1)).get();

        // Then the move should be illegal
        const reason: string = LinesOfActionFailure.INVALID_MOVE_LENGTH();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it(`should forbid to land on one of the player's pieces`, () => {
        const board: Table<PlayerOrNone> = [
            [_, _, O, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [_, _, O, _, _, _, _, _],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, _, O, O, O, O, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(2, 0), new Coord(2, 2)).get();

        // Then the move should be illegal
        const reason: string = RulesFailure.SHOULD_LAND_ON_EMPTY_OR_OPPONENT_SPACE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it(`should forbid to jump over an opponent's piece`, () => {
        const board: Table<PlayerOrNone> = [
            [_, O, _, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [_, X, O, _, _, _, _, _],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, O, O, O, O, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(2, 2), new Coord(0, 2)).get();

        // Then the move should be illegal
        const reason: string = LinesOfActionFailure.CANNOT_JUMP_OVER_OPPONENT();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should allow to jump over its own pieces', () => {
        const expectedBoard: Table<PlayerOrNone> = [
            [_, _, O, O, O, O, O, O],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, O, O, O, O, _],
        ];
        const state: LinesOfActionState = LinesOfActionRules.get().getInitialState();
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(1, 0), new Coord(7, 0)).get();
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should capture when landing on an opponent', () => {
        const board: Table<PlayerOrNone> = [
            [_, O, _, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [_, _, O, _, X, _, _, _],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, O, O, O, O, _],
        ];
        const expectedBoard: Table<PlayerOrNone> = [
            [_, O, _, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [_, _, _, _, O, _, _, _],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, O, O, O, O, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(2, 2), new Coord(4, 2)).get();
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should not detect win when there still are multiple groups', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, O],
            [_, _, X, _, O, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, X, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        expect(LinesOfActionRules.getVictory(state)).toEqual(MGPOptional.empty());
    });

    it('should win when a player has only one piece', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, O],
            [_, _, X, _, O, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const node: LinesOfActionNode = new LinesOfActionNode(state);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
    });

    it(`should win when all the player's pieces are connected, in any direction`, () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _],
            [X, _, _, _, O, _, _, X],
            [_, _, O, O, X, _, _, _],
            [_, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const node: LinesOfActionNode = new LinesOfActionNode(state);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
    });

    it('should draw on simultaneous connections', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [O, _, _, O, X, O, _, _],
            [_, _, _, O, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const move: LinesOfActionMove = LinesOfActionMove.from(new Coord(0, 2), new Coord(4, 2)).get();
        const expectedBoard: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, O, O, O, _, _],
            [_, _, _, O, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, _],
        ];
        const expectedState: LinesOfActionState = new LinesOfActionState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        const node: LinesOfActionNode = new LinesOfActionNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeOngoing(rules, node, defaultConfig);
        expect(LinesOfActionRules.getVictory(expectedState)).toEqual(MGPOptional.of(PlayerOrNone.NONE));
    });

    it('should list all possible targets', () => {
        const state: LinesOfActionState = LinesOfActionRules.get().getInitialState();
        const targets: CoordSet = LinesOfActionRules.possibleTargets(state, new Coord(4, 7));
        const expectedTargetList: Coord[] = [new Coord(4, 5), new Coord(6, 5), new Coord(2, 5)];
        const expectedTargetSet: CoordSet = new CoordSet(expectedTargetList);
        expect(targets.equals(expectedTargetSet)).toBeTrue();
    });

    it('should list only legal moves in possible targets', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [O, _, O, _, X, _, _, _],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, X],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const targets: CoordSet = LinesOfActionRules.possibleTargets(state, new Coord(2, 2));
        expect(targets.equals(new Set([
            new Coord(1, 1),
            new Coord(1, 3),
            new Coord(2, 1),
            new Coord(2, 3),
            new Coord(3, 1),
            new Coord(3, 3),
        ]))).toBeTrue();
    });

});
