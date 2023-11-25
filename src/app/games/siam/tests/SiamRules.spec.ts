/* eslint-disable max-lines-per-function */
import { SiamNode, SiamRules } from '../SiamRules';
import { SiamMove } from '../SiamMove';
import { SiamPiece } from '../SiamPiece';
import { SiamState } from '../SiamState';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { SiamFailure } from '../SiamFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Coord } from 'src/app/jscaip/Coord';

describe('SiamRules', () => {

    let rules: SiamRules;

    const _: SiamPiece = SiamPiece.EMPTY;
    const M: SiamPiece = SiamPiece.MOUNTAIN;

    const U: SiamPiece = SiamPiece.LIGHT_UP;
    const L: SiamPiece = SiamPiece.LIGHT_LEFT;
    const R: SiamPiece = SiamPiece.LIGHT_RIGHT;
    const D: SiamPiece = SiamPiece.LIGHT_DOWN;

    const u: SiamPiece = SiamPiece.DARK_UP;
    const l: SiamPiece = SiamPiece.DARK_LEFT;
    const r: SiamPiece = SiamPiece.DARK_RIGHT;
    const d: SiamPiece = SiamPiece.DARK_DOWN;

    beforeEach(() => {
        rules = SiamRules.get();
    });

    it('should allow insertions', () => {
        // Given the initial board
        const state: SiamState = SiamRules.get().getInitialState();
        // When performing an insertion
        const move: SiamMove = SiamMove.from(-1, 4, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT).get();
        // Then it should succeed
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [r, _, _, _, _],
        ];
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });

    it('should allow moving a piece forward', () => {
        // Given a state with a piece already on the board
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, u, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        // When moving a piece forward
        const move: SiamMove = SiamMove.from(2, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();
        // Then it should succeed
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, u, _, _],
            [_, _, _, _, _],
        ];
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });

    it('should forbid moving pieces of the opponent', () => {
        // Given a state with a piece already on the board
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, U, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);

        // When trying to move a piece of the opponent
        const move: SiamMove = SiamMove.from(2, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();

        // Then it should fail
        const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should forbid moving the empty piece', () => {
        // Given a state
        const state: SiamState = SiamRules.get().getInitialState();

        // When trying to move an empty piece
        const move: SiamMove = SiamMove.from(2, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();

        // Then it should fail
        const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });

    it('should allow pushing', () => {
        // Given a board with pieces next to each other
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [R, _, _, _, _],
            [u, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        // When pushing the opponent's piece with the player's piece
        const move: SiamMove = SiamMove.from(0, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();
        // Then it should succeed
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [R, M, M, M, _],
            [u, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });

    it('should allow rotating a piece', () => {
        // Given a board with a piece
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [u, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        // When performing a rotation
        const move: SiamMove = SiamMove.from(0, 4, MGPOptional.empty(), Orthogonal.RIGHT).get();
        // Then it should succeed
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [r, _, _, _, _],
        ];
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });

    it('should allow rotating a piece by half a turn', () => {
        // Given a board with a piece
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [u, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        // When performing a half-turn rotation
        const move: SiamMove = SiamMove.from(0, 4, MGPOptional.empty(), Orthogonal.DOWN).get();
        // Then it should succeed
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [d, _, _, _, _],
        ];
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });

    it('should allow rotating and moving forward', () => {
        // Given a board with a piece
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [u, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        // When rotating the piece and moving it forward at the same time
        const move: SiamMove = SiamMove.from(0, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.DOWN).get();
        // Then it should succeed
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [d, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });

    it('should forbid staying in the same orientation through a fake rotation', () => {
        // Given a board with a player piece
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, u, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);

        // When trying to perform a rotation that does not change the orientation
        const move: SiamMove = SiamMove.from(2, 4, MGPOptional.empty(), Orthogonal.UP).get();

        // Then it should fail
        const reason: string = SiamFailure.MUST_MOVE_OR_ROTATE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });

    it('should allow moving in a direction different from the orientation of the piece', () => {
        // Given a board with a piece
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [u, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);

        // When moving the piece in a different direction than its orientation
        const move: SiamMove = SiamMove.from(0, 4, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.LEFT).get();

        // Then it should succeed
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, l, _, _, _],
        ];
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });

    it('should forbid pushing one against one', () => {
        // Given a board with head-to-head pieces
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [D, _, _, _, _],
            [u, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);

        // When trying to push the other piece
        const move: SiamMove = SiamMove.from(0, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();

        // Then it should fail
        const reason: string = SiamFailure.NOT_ENOUGH_FORCE_TO_PUSH();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });

    it('should forbid pushing one against one, next to a border', () => {
        // Given a board with head-to-head pieces, with one next to the border
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [d, _, _, _, _],
            [U, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);

        // When trying to push the other piece over the border
        const move: SiamMove = SiamMove.from(0, 3, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN).get();

        // Then it should fail
        const reason: string = SiamFailure.NOT_ENOUGH_FORCE_TO_PUSH();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });

    it('should allow to push two against one', () => {
        // Given a board with two pieces against one
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [D, M, M, M, _],
            [u, _, _, _, _],
            [u, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        // When pushing the one piece
        const move: SiamMove = SiamMove.from(0, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();
        // Then it should succeed
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [D, _, _, _, _],
            [u, M, M, M, _],
            [u, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });

    it('should forbid to push two against one in case of sandwich', () => {
        // Given a board with two pieces against one, where the one is sandwiched between the other pieces
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [u, M, M, M, _],
            [D, _, _, _, _],
            [u, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);

        // When tryig to push the one piece
        const move: SiamMove = SiamMove.from(0, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();

        // Then it should fail
        const reason: string = SiamFailure.NOT_ENOUGH_FORCE_TO_PUSH();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });

    it('should forbid to push while changing direction', () => {
        // Given a board with two pieces head-to-head
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [L, _, _, _, _],
            [u, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);

        // When trying to push and change direction at the same time
        const move: SiamMove = SiamMove.from(0, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.LEFT).get();

        // Then it should fail
        const reason: string = SiamFailure.ILLEGAL_PUSH();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });

    it('should be forbidden to insert a sixth peice', () => {
        // Given a board with 5 pieces of the player
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [u, u, u, u, u],
        ];
        const state: SiamState = new SiamState(board, 0);

        // When trying to insert a 6th piece
        const move: SiamMove = SiamMove.from(0, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN).get();

        // Then it should fail
        const reason: string = SiamFailure.NO_REMAINING_PIECE_TO_INSERT();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });

    it('should be forbidden to push several mountains with a single piece', () => {
        // Given a board with a piece next to aligned mountains
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [r, M, M, _, _],
            [_, _, _, M, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);

        // When trying to push more than one mountain
        const move: SiamMove = SiamMove.from(0, 2, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT).get();

        // Then it should fail
        const reason: string = SiamFailure.NOT_ENOUGH_FORCE_TO_PUSH();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });

    it('should be allowed to push two montains with two pushers', () => {
        // Given a board with two pushers next to the mountains
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [r, r, M, M, _],
            [_, _, _, M, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        // When pushing two mountains
        const move: SiamMove = SiamMove.from(0, 2, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT).get();
        // Then it should succeed
        const expectedBoard: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, r, r, M, M],
            [_, _, _, M, _],
            [_, _, _, _, _],
        ];
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });

    it('should assign victory to Player.ZERO if its pieces push the mountain out of the board', () => {
        // Given a board with two Player.ZERO pieces ready to push a mountain
        const board: Table<SiamPiece> = [
            [_, _, M, _, _],
            [_, _, u, _, _],
            [_, M, u, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        // When pushing the mountain out of the board
        const move: SiamMove = SiamMove.from(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();
        // Then it should succeed
        const expectedBoard: Table<SiamPiece> = [
            [_, _, u, _, _],
            [_, _, u, _, _],
            [_, M, _, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        // and victory should be for player zero
        const node: SiamNode = new SiamNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO);
    });

    it('should assign victory to the player closest to and aligned with the fallen mountain', () => {
        // Given a board where 0 can push 1 that pushes the mountain
        const board: Table<SiamPiece> = [
            [_, _, M, _, _],
            [_, _, U, _, _],
            [_, M, u, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        // When pushing the mountain out of the board
        const move: SiamMove = SiamMove.from(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();
        // Then it should succeed
        const expectedBoard: Table<SiamPiece> = [
            [_, _, U, _, _],
            [_, _, u, _, _],
            [_, M, _, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        // and victory should be for player zero
        const node: SiamNode = new SiamNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE);
    });

    it('should assign victory to player closest to and aligned with the fallen mountain (and not to the non-aligned pieces)', () => {
        // Given a board where the piece next to the mountain is not aligned vertically
        const board: Table<SiamPiece> = [
            [_, _, M, _, _],
            [_, _, L, _, _],
            [_, M, r, M, _],
            [_, _, r, _, _],
            [_, _, r, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        // When pushing the mountain out of the board vertically
        const move: SiamMove = SiamMove.from(2, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();
        // Then it should succeed
        const expectedBoard: Table<SiamPiece> = [
            [_, _, L, _, _],
            [_, _, r, _, _],
            [_, M, r, M, _],
            [_, _, r, _, _],
            [_, _, u, _, _],
        ];
        const expectedState: SiamState = new SiamState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        // and victory should be for player zero, whose pieces are aligned with the push
        const node: SiamNode = new SiamNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO);
    });

    it('should compute empty list of moves between two impossible squares', () => {
        // Given two coordinatess that are not neighbors
        const state: SiamState = SiamRules.get().getInitialState();
        const start: Coord = new Coord(0, 0);
        const end: Coord = new Coord(2, 2);
        // When computing the list of moves between these coords
        const moves: SiamMove[] = rules.getMovesBetween(state, SiamPiece.LIGHT_UP, start, end);
        // Then there should be no moves
        expect(moves).toEqual([]);
    });

    it('should compute empty list of moves between aligned squares that are too far away', () => {
        // Given two coordinatess that are aligned but of a distance greater than one
        const state: SiamState = SiamRules.get().getInitialState();
        const start: Coord = new Coord(0, 0);
        const end: Coord = new Coord(2, 0);
        // When computing the list of moves between these coords
        const moves: SiamMove[] = rules.getMovesBetween(state, SiamPiece.LIGHT_UP, start, end);
        // Then there should be no moves
        expect(moves).toEqual([]);
    });

    it('should compute the pusher player even with a mountain amongs the pushers', () => {
        // Given a board where there is a mountain amongst the pusher,
        // and a winning move
        const board: Table<SiamPiece> = [
            [_, _, M, _, _],
            [_, _, u, _, _],
            [_, M, M, _, _],
            [_, _, U, _, _],
            [_, _, u, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        const move: SiamMove = SiamMove.from(2, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.UP).get();
        // When computing the pusher for the winning move
        const pusher: PlayerOrNone = rules.getPusher(state, move);
        // Then it should identify the right player
        expect(pusher).toBe(Player.ZERO);
    });

});
