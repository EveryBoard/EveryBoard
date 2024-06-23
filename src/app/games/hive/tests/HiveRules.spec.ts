/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table } from 'src/app/jscaip/TableUtils';
import { MGPOptional, Set, Utils } from '@everyboard/lib';
import { HiveFailure } from '../HiveFailure';
import { HiveMove, HiveCoordToCoordMove } from '../HiveMove';
import { HivePiece } from '../HivePiece';
import { HiveNode, HiveRules } from '../HiveRules';
import { HiveState } from '../HiveState';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { CoordSet } from 'src/app/jscaip/CoordSet';

describe('HiveRules', () => {

    let rules: HiveRules;
    const defaultConfig: NoConfig = HiveRules.get().getDefaultRulesConfig();

    const Q: HivePiece = new HivePiece(Player.ZERO, 'QueenBee');
    const B: HivePiece = new HivePiece(Player.ZERO, 'Beetle');
    const G: HivePiece = new HivePiece(Player.ZERO, 'Grasshopper');
    const S: HivePiece = new HivePiece(Player.ZERO, 'Spider');
    const A: HivePiece = new HivePiece(Player.ZERO, 'SoldierAnt');
    const q: HivePiece = new HivePiece(Player.ONE, 'QueenBee');
    const b: HivePiece = new HivePiece(Player.ONE, 'Beetle');
    const g: HivePiece = new HivePiece(Player.ONE, 'Grasshopper');
    const s: HivePiece = new HivePiece(Player.ONE, 'Spider');
    const a: HivePiece = new HivePiece(Player.ONE, 'SoldierAnt');

    beforeEach(() => {
        rules = HiveRules.get();
    });

    describe('dropping', () => {

        it('should allow first player to drop any piece initially', () => {
            // Given the initial state
            const state: HiveState = HiveRules.get().getInitialState();

            // When dropping the first piece
            const move: HiveMove = HiveMove.drop(B, new Coord(0, 0));

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[B]],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 1);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow second player to drop a piece next to the first piece', () => {
            // Given a state with a piece already on the board
            const board: Table<HivePiece[]> = [
                [[B]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 1);

            // When dropping a piece next to the first piece
            const move: HiveMove = HiveMove.drop(b, new Coord(1, 0));

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[B], [b]],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 2);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid second player to drop a piece somewhere else than next to the first piece', () => {
            // Given a state with a piece already on the board
            const board: Table<HivePiece[]> = [
                [[B]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 1);

            // When dropping a piece not next to the first piece
            const move: HiveMove = HiveMove.drop(b, new Coord(3, 0));

            // Then the move should be illegal
            const reason: string = HiveFailure.MUST_BE_CONNECTED_TO_HIVE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);

        });

        it('should allow dropping a piece adjacent to another one of your pieces', () => {
            // Given a state with a piece of the current player already on the board
            const board: Table<HivePiece[]> = [
                [[b], [B]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When dropping a piece next to our piece
            const move: HiveMove = HiveMove.drop(A, new Coord(2, 0));

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[b], [B], [A]],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 3);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid dropping a piece adjacent to a piece of the opponent', () => {
            // Given a state with a piece of the opponent already on the board
            const board: Table<HivePiece[]> = [
                [[B], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When dropping a piece next to the opponent's piece
            const move: HiveMove = HiveMove.drop(A, new Coord(2, 0));

            // Then the move should be illegal
            const reason: string = HiveFailure.CANNOT_DROP_NEXT_TO_OPPONENT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow dropping a piece adjacent to a player-controlled stack containing a piece of the opponent', () => {
            // Given a state with a piece of the opponent already on the board, but under another piece of ours
            const board: Table<HivePiece[]> = [
                [[B], [B, b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When dropping a piece next to the stack
            const move: HiveMove = HiveMove.drop(A, new Coord(2, 0));

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[B], [B, b], [A]],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 3);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow dropping the queen bee at the fourth turn of a player', () => {
            // Given a state in the fourth turn of player zero, without queen bee
            const board: Table<HivePiece[]> = [
                [[B], [G], [S], [b], [g], [s]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 6);

            // When dropping the queen bee
            const move: HiveMove = HiveMove.drop(Q, new Coord(0, 1));

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[B], [G], [S], [b], [g], [s]],
                [[Q], [], [], [], [], []],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 7);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should force dropping the queen bee at turn 6 for Player.ZERO', () => {
            // Given a state in the fourth turn of player zero, without queen bee
            const board: Table<HivePiece[]> = [
                [[B], [G], [S], [b], [g], [s]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 6);

            // When dropping another piece than the queen bee
            const move: HiveMove = HiveMove.drop(A, new Coord(0, 1));

            // Then the move should be illegal
            const reason: string = HiveFailure.MUST_PLACE_QUEEN_BEE_LATEST_AT_FOURTH_TURN();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should force dropping the queen bee at turn 7 for Player.ONE', () => {
            // Given a state in the fourth turn of player one, without queen bee
            const board: Table<HivePiece[]> = [
                [[Q], [B], [G], [S], [b], [g], [s]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 7);

            // When dropping another piece than the queen bee
            const move: HiveMove = HiveMove.drop(a, new Coord(7, 0));

            // Then the move should be illegal
            const reason: string = HiveFailure.MUST_PLACE_QUEEN_BEE_LATEST_AT_FOURTH_TURN();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid dropping the beetle on top of another piece', () => {
            // Given a state
            const board: Table<HivePiece[]> = [
                [[Q], [B], [s], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When dropping the beetle on another piece
            const move: HiveMove = HiveMove.drop(B, new Coord(0, 0));

            // Then the move should be illegal
            const reason: string = HiveFailure.MUST_DROP_ON_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid to drop a piece that the player does not have anymore', () => {
            // Given a state where the player has placed all of its beetles
            const board: Table<HivePiece[]> = [
                [[Q], [B], [s], [B]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When trying to drop yet another beetle
            const move: HiveMove = HiveMove.drop(B, new Coord(4, 0));

            // Then the move should be illegal
            const reason: string = HiveFailure.CANNOT_DROP_PIECE_YOU_DONT_HAVE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid dropping a piece of the opponent', () => {
            // Given any state
            const board: Table<HivePiece[]> = [
                [[Q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 1);

            // When trying to drop a piece of the opponent
            const move: HiveMove = HiveMove.drop(B, new Coord(0, 1));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

    });

    describe('moving', () => {

        it('should be forbidden to move if the queen bee is not on the board', () => {
            // Given a state without the player's queen bee
            const board: Table<HivePiece[]> = [
                [[B], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When trying to move a piece
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(0, 1)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.QUEEN_BEE_MUST_BE_ON_BOARD_BEFORE_MOVE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should be forbidden to move from an empty space', () => {
            // Given a state
            const board: Table<HivePiece[]> = [
                [[Q], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When trying to move from an empty space
            const move: HiveMove = HiveMove.move(new Coord(-1, 0), new Coord(0, 0)).get();

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should be forbidden to move a piece of the opponent', () => {
            // Given a state
            const board: Table<HivePiece[]> = [
                [[Q], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When trying to move a piece of the opponent
            const move: HiveMove = HiveMove.move(new Coord(1, 0), new Coord(0, 1)).get();

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should be forbidden to move a piece under a beetle of the opponent', () => {
            // Given a state where the opponent has a beetle on top of one of the player's piece
            const board: Table<HivePiece[]> = [
                [[q], [b, Q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When trying to move the piece from under the beetle
            const move: HiveMove = HiveMove.move(new Coord(1, 0), new Coord(0, 1)).get();

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should be forbidden to move on top of another piece for non-beetles (queen bee)', () => {
            // Given a state
            const board: Table<HivePiece[]> = [
                [[Q], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When trying to move a non-beetle on top of another piece
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(1, 0)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.THIS_PIECE_CANNOT_CLIMB();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should be forbidden to move on top of another piece for non-beetles (grasshopper)', () => {
            // Given a state
            const board: Table<HivePiece[]> = [
                [[G], [b], [Q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When trying to move a grasshopper on top of another piece
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(2, 0)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.THIS_PIECE_CANNOT_CLIMB();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should be forbidden to move on top of another piece for non-beetles (ant)', () => {
            // Given a state
            const board: Table<HivePiece[]> = [
                [[A], [b], [Q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When trying to move the ant on top of another piece
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(1, 0)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.MUST_BE_ABLE_TO_SLIDE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should be forbidden to move on top of another piece for non-beetles (spider)', () => {
            // Given a state
            const board: Table<HivePiece[]> = [
                [[S], [b], [Q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When trying to move the spider on top of another piece
            const move: HiveMove = HiveMove.spiderMove([
                new Coord(0, 0),
                new Coord(0, 1),
                new Coord(1, 1),
                new Coord(1, 0),
            ]);

            // Then the move should be illegal
            const reason: string = HiveFailure.THIS_PIECE_CANNOT_CLIMB();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow moving queen bee by one space', () => {
            // Given a state with the player's queen bee on the board
            const board: Table<HivePiece[]> = [
                [[Q], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When moving the queen bee by one space
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(0, 1)).get();

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[], [b]],
                [[Q], []],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 3);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid moving queen bee by more than one space', () => {
            // Given a state with the player's queen bee on the board
            const board: Table<HivePiece[]> = [
                [[Q], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When moving the queen bee by two spaces
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(1, 1)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.QUEEN_BEE_CAN_ONLY_MOVE_TO_DIRECT_NEIGHBORS();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow moving beetle by one space', () => {
            // Given a state with the player's beetle on the board
            const board: Table<HivePiece[]> = [
                [[B], [Q], [q], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving the beetle by one space
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(0, 1)).get();

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[], [Q], [q], [b]],
                [[B], [], [], []],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 5);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid moving beetle by more than one space', () => {
            // Given a state with the player's beetle on the board
            const board: Table<HivePiece[]> = [
                [[B], [Q], [q], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving the beetle by two space
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(1, 1)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.BEETLE_CAN_ONLY_MOVE_TO_DIRECT_NEIGHBORS();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow moving beetle on top of another piece', () => {
            // Given a state with the player's beetle on the board
            const board: Table<HivePiece[]> = [
                [[B], [Q], [q], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving the beetle on top of its neighbor
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(1, 0)).get();

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[], [B, Q], [q], [b]],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 5);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow moving the beetle when it is on top of another piece', () => {
            // Given a state with the player's beetle on top of another piece
            const board: Table<HivePiece[]> = [
                [[B, Q], [q], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving the beetle to an adjacent space
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(1, 0)).get();

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[Q], [B, q], [b]],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 5);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should support having the 4 beetles on top of a piece', () => {
            // Given a state with 3 beetles on top of each other, on top of another piece
            const board: Table<HivePiece[]> = [
                [[B, B, b, s], [b, q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 3);

            // When moving the beetle on top of the other ones
            const move: HiveMove = HiveMove.move(new Coord(1, 0), new Coord(0, 0)).get();

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[b, B, B, b, s], [q]],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 4);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow the grasshopper to jump above other adjacent pieces', () => {
            // Given a state with one grasshopper ready to jump
            const board: Table<HivePiece[]> = [
                [[G], [Q]],
                [[q], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When jumping with the grasshopper over a piece
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(0, 2)).get();

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[], [Q]],
                [[q], [b]],
                [[G], []],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 5);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid the grasshopper to move without jumping', () => {
            // Given a state with one grasshopper
            const board: Table<HivePiece[]> = [
                [[G], [Q]],
                [[q], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving the grasshopper without jumping
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(1, -1)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.GRASSHOPPER_MUST_JUMP_OVER_PIECES();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow the grasshopper to jump over more than one piece', () => {
            // Given a state with one grasshopper ready to jump over multiple pieces
            const board: Table<HivePiece[]> = [
                [[G], [Q], [b]],
                [[q], [b], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When jumping with the grasshopper over a piece
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(3, 0)).get();

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[], [Q], [b], [G]],
                [[q], [b], [], []],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 5);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid the grasshopper to jump if there are empty spaces before the piece jumped above', () => {
            // Given a state with one grasshopper next to an empty space followed by a piece
            const board: Table<HivePiece[]> = [
                [[G], [], [b]],
                [[q], [b], [Q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When trying to jump over the empty space and the piece
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(3, 0)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.GRASSHOPPER_MUST_JUMP_OVER_PIECES();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid the grasshopper of moving by one space', () => {
            // Given a state with one grasshopper next to an empty space
            const board: Table<HivePiece[]> = [
                [[G], [], []],
                [[q], [b], [Q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving by a single space
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(3, 0)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.GRASSHOPPER_MUST_JUMP_OVER_PIECES();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid the grasshopper of jumping over nothing', () => {
            // Given a state with one grasshopper next to an empty space
            const board: Table<HivePiece[]> = [
                [[G], [], []],
                [[q], [b], [Q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When trying to jump over nothing
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(3, 0)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.GRASSHOPPER_MUST_JUMP_OVER_PIECES();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid the grasshopper of moving not in a straight line', () => {
            // Given a state with one grasshopper
            const board: Table<HivePiece[]> = [
                [[G], [], []],
                [[q], [b], [Q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving by a single space
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(3, 1)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.GRASSHOPPER_MUST_MOVE_IN_STRAIGHT_LINE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving the spider by a regular move instead of a spider move', () => {
            spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            // Given a board with a spider
            const board: Table<HivePiece[]> = [
                [[Q], [S], [q]],
                [[A], [a], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving the spider with a regular move
            const move: HiveMove = HiveMove.move(new Coord(1, 0), new Coord(2, -1)).get();

            // Then the move should be illegal and an error should be logged
            expect(() => rules.isLegal(move, state)).toThrow();
            expect(Utils.logError).toHaveBeenCalledWith('Assertion failure', 'HiveSpiderRules: move should be a spider move', undefined);
        });

        it('should allow the spider to move by 3 spaces', () => {
            // Given a board with a spider
            const board: Table<HivePiece[]> = [
                [[Q], [S], [q]],
                [[A], [a], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving the spider by 3 spaces
            const move: HiveMove = HiveMove.spiderMove([
                new Coord(1, 0),
                new Coord(2, -1),
                new Coord(3, -1),
                new Coord(3, 0),
            ]);

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[Q], [], [q], [S]],
                [[A], [a], [], []],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 5);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid the spider to move through non-consecutive spaces', () => {
            // Given a board with a spider
            const board: Table<HivePiece[]> = [
                [[Q], [S], [q]],
                [[A], [a], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving the spider non-consecutive spaces
            const move: HiveMove = HiveMove.spiderMove([
                new Coord(1, 0),
                new Coord(3, -1),
                new Coord(2, -1),
                new Coord(3, 0),
            ]);

            // Then the move should be illegal
            const reason: string = HiveFailure.SPIDER_MUST_MOVE_ON_NEIGHBORING_SPACES();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid the spider to move through another piece', () => {
            // Given a board with a spider
            const board: Table<HivePiece[]> = [
                [[Q], [S], [q]],
                [[A], [a], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving the spider through another piece
            const move: HiveMove = HiveMove.spiderMove([
                new Coord(1, 0),
                new Coord(2, -1),
                new Coord(2, 0),
                new Coord(3, 0),
            ]);

            // Then the move should be illegal
            const reason: string = HiveFailure.THIS_PIECE_CANNOT_CLIMB();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid the spider to backtrack', () => {
            // Given a board with a spider
            const board: Table<HivePiece[]> = [
                [[Q], [S], [q]],
                [[A], [a], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving the spider twice to the same position
            const move: HiveMove = HiveMove.spiderMove([
                new Coord(1, 0),
                new Coord(2, -1),
                new Coord(3, -1),
                new Coord(2, -1),
            ]);

            // Then the move should be illegal
            const reason: string = HiveFailure.SPIDER_CANNOT_BACKTRACK();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid the spider to move along pieces with which it is not in direct contact', () => {
            // Given a board with a spider
            const board: Table<HivePiece[]> = [
                [[Q], [S], [], [A]],
                [[A], [], [], [G]],
                [[a], [b], [g], [q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving the spider not along pieces it is in direct contact with
            const move: HiveMove = HiveMove.spiderMove([
                new Coord(1, 0),
                new Coord(2, 0),
                new Coord(2, 1),
                new Coord(1, 1),
            ]);

            // Then the move should be illegal
            const reason: string = HiveFailure.SPIDER_CAN_ONLY_MOVE_WITH_DIRECT_CONTACT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow the soldier ant to move anywhere (as long as it does not break the restrictions)', () => {
            // Given a board with a soldier ant
            const board: Table<HivePiece[]> = [
                [[Q], [A]],
                [[S], []],
                [[a], [b]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When moving the soldier ant anywhere
            const move: HiveMove = HiveMove.move(new Coord(1, 0), new Coord(0, 3)).get();

            // Then the move should succeed
            const expectedBoard: Table<HivePiece[]> = [
                [[Q], []],
                [[S], []],
                [[a], [b]],
                [[A], []],
            ];
            const expectedState: HiveState = HiveState.fromRepresentation(expectedBoard, 5);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('restrictions', () => {

        it('should be forbidden to split the hive in two', () => {
            // Given a board
            const board: Table<HivePiece[]> = [
                [[q], [Q], [A]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When trying to perform a move that would split the hive in two
            const move: HiveMove = HiveMove.move(new Coord(1, 0), new Coord(2, -1)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.CANNOT_DISCONNECT_HIVE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should be forbidden to have a piece escape from the hive', () => {
            // Given a board
            const board: Table<HivePiece[]> = [
                [[Q], [q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 2);

            // When trying to perform a move that would split the hive in two
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(-1, 0)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.CANNOT_DISCONNECT_HIVE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should be forbidden to split the hive in two, even in the middle of a turn', () => {
            // Given a board
            const board: Table<HivePiece[]> = [
                [[], [q], [b]],
                [[B], [], [Q]],
                [[A], [], []],
                [[g], [], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When trying to perform a move that would split the hive in two temporarily
            const move: HiveMove = HiveMove.move(new Coord(0, 2), new Coord(1, 2)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.CANNOT_DISCONNECT_HIVE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);

        });

        it('should be forbidden to move in a non-sliding movement (moving out)', () => {
            // Given a board with a piece surrounded by 5 others
            const board: Table<HivePiece[]> = [
                [[], [q], [b]],
                [[B], [A], [Q]],
                [[s], [], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When trying to perform a move that could not be done by sliding the piece
            const move: HiveMove = HiveMove.move(new Coord(1, 1), new Coord(1, 2)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.MUST_BE_ABLE_TO_SLIDE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);

        });

        it('should be forbidden to move in a non-sliding movement (moving in)', () => {
            // Given a board
            const board: Table<HivePiece[]> = [
                [[], [q], [b]],
                [[B], [], [Q]],
                [[s], [A], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When trying to perform a move that could not be done by sliding the piece
            const move: HiveMove = HiveMove.move(new Coord(1, 2), new Coord(1, 1)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.MUST_BE_ABLE_TO_SLIDE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should be forbidden to move in a non-sliding movement (with only 3 neighbors)', () => {
            // Given a board where a piece is surrounded by 3 pieces, each separated between each other by one space
            const board: Table<HivePiece[]> = [
                [[], [A], [q], []],
                [[A], [], [Q], [b]],
                [[a], [a], [], [B]],
                [[], [b], [B], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 12);

            // When trying to move the surrounded piece
            const move: HiveMove = HiveMove.move(new Coord(2, 1), new Coord(3, 0)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.MUST_BE_ABLE_TO_SLIDE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should be forbidden to move in a non-sliding movement (into a closed space)', () => {
            // Given a board where there is a closed space and a spider outside of the closed space
            const board: Table<HivePiece[]> = [
                [[A], [A], [q], [Q]],
                [[a], [], [], [b]],
                [[a], [a], [], [B]],
                [[], [b], [B], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 12);

            // When trying to move the spider in the closed space
            const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(1, 1)).get();

            // Then the move should be illegal
            const reason: string = HiveFailure.MUST_BE_ABLE_TO_SLIDE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should be able to move in a non-sliding movement (for a spider)', () => {
            // Given a board
            const board: Table<HivePiece[]> = [
                [[], [q], []],
                [[B], [], [Q]],
                [[s], [S], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);

            // When trying to perform a move that could not be done by sliding the piece
            const move: HiveMove = HiveMove.spiderMove([
                new Coord(1, 2),
                new Coord(1, 1),
                new Coord(2, 0),
                new Coord(3, 0),
            ]);

            // Then the move should be illegal
            const reason: string = HiveFailure.MUST_BE_ABLE_TO_SLIDE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);

        });

    });

    it('should allow passing if a player cannot perform any action', () => {
        // Given a board in a stuck position for a player: here, the player cannot
        // drop a piece nor move one as its only pieces are below an opponent
        const board: Table<HivePiece[]> = [
            [[Q], [B, b, q]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 5);

        // When passing
        const move: HiveMove = HiveMove.PASS;

        // Then the move should succeed
        const expectedState: HiveState = HiveState.fromRepresentation(board, 6);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should forbid passing if a player can perform any action', () => {
        // Given a board where the player can do something
        const board: Table<HivePiece[]> = [
            [[Q], [q]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 4);

        // When trying to pass
        const move: HiveMove = HiveMove.PASS;

        // Then the move should be illegal
        const reason: string = RulesFailure.CANNOT_PASS();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should not have drop locations if all pieces are already on the board', () => {
        // Given a board containing all pieces
        const board: Table<HivePiece[]> = [
            [[Q], [q], [B], [B], [b], [b]],
            [[G], [G], [G], [g], [g], [g]],
            [[A], [A], [A], [a], [a], [a]],
            [[S], [S], [s], [s], [], []],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 12);

        // When computing the possible drop locations
        const dropLocations: CoordSet = rules.getPossibleDropLocations(state);

        // Then there should be none
        expect(dropLocations.size()).toBe(0);
    });

    it('should compute the expected spider moves for a specific board', () => {
        // Given a specific state with 4 possible spider moves
        const board: Table<HivePiece[]> = [
            [[], [S], [s], [b]],
            [[], [], [], [B]],
            [[b], [], [], [a]],
            [[A], [], [G], []],
            [[Q], [g], [], []],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 6);

        // When computing the possible moves for the spider
        const moves: Set<HiveCoordToCoordMove> = rules.getPossibleMovesFrom(state, new Coord(1, 0));
        // Then we should have exactly 4 moves
        expect(moves.size()).toBe(4);
    });

    describe('victories', () => {

        it('should consider winning player the one who has fully surrounded the queen bee of the opponent (Player.ZERO)', () => {
            // Given a board where the queen of player one is surrounded
            const board: Table<HivePiece[]> = [
                [[], [b], [b]],
                [[B], [q], [Q]],
                [[s], [A], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);
            const node: HiveNode = new HiveNode(state, MGPOptional.empty(), MGPOptional.empty());

            // Then player zero wins
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it('should consider winning player the one who has fully surrounded the queen bee of the opponent (Player.ONE)', () => {
            // Given a board where the queen of player zero is surrounded
            const board: Table<HivePiece[]> = [
                [[], [b], [b]],
                [[B], [Q], [q]],
                [[s], [A], []],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);
            const node: HiveNode = new HiveNode(state, MGPOptional.empty(), MGPOptional.empty());

            // Then player one wins
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

        it('should be a draw if both players have their queen bee surrounded', () => {
            // Given a board where both queens are surrounded
            const board: Table<HivePiece[]> = [
                [[], [b], [b], [g]],
                [[B], [Q], [q], [G]],
                [[s], [A], [a], [B]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);
            const node: HiveNode = new HiveNode(state, MGPOptional.empty(), MGPOptional.empty());

            // Then player it is a draw
            RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        });

        it('should be ongoing if no queen bee is surrounded', () => {
            // Given a board where no queen is surrounded
            const board: Table<HivePiece[]> = [
                [[q], [Q]],
            ];
            const state: HiveState = HiveState.fromRepresentation(board, 4);
            const node: HiveNode = new HiveNode(state, MGPOptional.empty(), MGPOptional.empty());

            // Then it should be considered as ongoing
            RulesUtils.expectToBeOngoing(rules, node, defaultConfig);
        });

    });

});
