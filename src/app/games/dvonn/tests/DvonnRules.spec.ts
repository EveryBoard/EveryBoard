/* eslint-disable max-lines-per-function */
import { DvonnPieceStack } from '../DvonnPieceStack';
import { DvonnState } from '../DvonnState';
import { Coord } from 'src/app/jscaip/Coord';
import { DvonnMove } from '../DvonnMove';
import { Player } from 'src/app/jscaip/Player';
import { DvonnNode, DvonnRules } from '../DvonnRules';
import { DvonnFailure } from '../DvonnFailure';
import { DvonnMinimax } from '../DvonnMinimax';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Minimax } from 'src/app/jscaip/Minimax';
import { MaxStacksDvonnMinimax } from '../MaxStacksDvonnMinimax';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('DvonnRules:', () => {

    let rules: DvonnRules;

    let minimaxes: Minimax<DvonnMove, DvonnState>[];

    const N: DvonnPieceStack = DvonnPieceStack.NONE;
    const _: DvonnPieceStack = DvonnPieceStack.EMPTY;
    const S: DvonnPieceStack = DvonnPieceStack.SOURCE;
    const O: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
    const OX: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 2, false);
    const OO: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 2, false);
    const OD: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 2, true);
    const OOO: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 3, false);
    const X: DvonnPieceStack = DvonnPieceStack.PLAYER_ONE;
    const XS: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 2, true);
    const XX: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 2, false);
    const XSX: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 3, true);
    const X5: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 5, false);
    const X6: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 6, false);
    const XS6: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 6, true);
    const O6: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 6, false);
    const OS6: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 6, true);

    beforeEach(() => {
        rules = new DvonnRules(DvonnState);
        minimaxes = [
            new DvonnMinimax(rules, 'DvonnMinimax'),
            new MaxStacksDvonnMinimax(rules, 'MaxStacksDvonnMinimax'),
        ];
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gameState.turn).withContext('Game should start at turn 0').toBe(0);
    });
    it('initial stacks should be of size 1', () => {
        const state: DvonnState = rules.node.gameState;
        for (let y: number = 0; y < DvonnState.HEIGHT; y++) {
            for (let x: number = 0; x < DvonnState.WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                if (state.isOnBoard(coord)) {
                    const stack: DvonnPieceStack = state.getPieceAt(coord);
                    expect(stack.getSize()).toEqual(1);
                    expect(stack.isEmpty()).toBeFalse();
                }
            }
        }
    });
    it('should allow 11 pieces to move in the first turn', () => {
        // 6. Important: a piece or stack that is surrounded on all 6 sides may
        // not be moved. So, at the beginning of the game only the pieces at
        // the edge of the board may move. The pieces that are not positioned at
        // the edge remain blocked for as long as they remain completely
        // surrounded (see diagram below).
        const state: DvonnState = rules.node.gameState;
        const firstTurnMovablePieces: Coord[] = DvonnRules.getMovablePieces(state);
        expect(firstTurnMovablePieces.length).toEqual(11);
    });
    it('should provide 41 moves in the first turn on the balanced board', () => {
        const firstTurnMoves: DvonnMove[] = minimaxes[0].getListMoves(rules.node);
        expect(firstTurnMoves.length).toEqual(41);
    });
    it('should only allow moves from the current player color', () => {
        const state: DvonnState = rules.node.gameState;
        const movablePieces: Coord[] = DvonnRules.getMovablePieces(state);
        for (const coord of movablePieces) {
            expect(state.getPieceAt(coord).belongsTo(Player.ZERO)).toBeTrue();
        }
        const moves: DvonnMove[] = minimaxes[0].getListMoves(rules.node);
        const state2: DvonnState = rules.applyLegalMove(moves[0], state, undefined);
        const movablePieces2: Coord[] = DvonnRules.getMovablePieces(state2);
        for (const coord of movablePieces2) {
            expect(state2.getPieceAt(coord).belongsTo(Player.ONE)).toBeTrue();
        }
        const move: DvonnMove = DvonnMove.of(new Coord(1, 1), new Coord(1, 2));
        RulesUtils.expectMoveFailure(rules, state, move, DvonnFailure.NOT_PLAYER_PIECE());
    });
    it('should forbid moves for pieces with more than 6 neighbors', () => {
        const state: DvonnState = rules.node.gameState;
        const move: DvonnMove = DvonnMove.of(new Coord(1, 3), new Coord(1, 2));
        RulesUtils.expectMoveFailure(rules, state, move, DvonnFailure.TOO_MANY_NEIGHBORS());
    });
    it('should forbid moves from an empty stack', () => {
        const board: Table<DvonnPieceStack> = [
            [N, N, _, X, X, X, O, O, X, S, X],
            [N, X, X, O, O, O, X, X, O, X, X],
            [OX, X, X, X, O, S, X, O, O, O, O],
            [_, O, X, O, O, X, X, X, O, O, N],
            [O, S, O, X, X, O, O, O, X, N, N],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(2, 1));
        RulesUtils.expectMoveFailure(rules, state, move, DvonnFailure.EMPTY_STACK());
    });
    it('should forbid moves with pieces that cannot reach any target', () => {
        const board: Table<DvonnPieceStack> = [
            [N, N, OO, S, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, X, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, _, _, N, N],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(4, 0));
        RulesUtils.expectMoveFailure(rules, state, move, DvonnFailure.CANT_REACH_TARGET());
    });
    it('should forbid moves with a different length than the stack size', () => {
        const board: Table<DvonnPieceStack> = [
            [N, N, OO, X, _, _, _, _, _, _, _],
            [N, OOO, XS, O, O, _, _, S, _, _, _],
            [XX, X, X, _, O, _, _, XX, _, _, _],
            [O, _, X, OOO, O, _, _, _, _, _, N],
            [O, S, O, X, X, O, _, _, _, N, N],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(3, 0));
        RulesUtils.expectMoveFailure(rules, state, move, DvonnFailure.INVALID_MOVE_LENGTH());
    });
    it('should have the target stack owned by the owner of the source stack after the move', () => {
        const expectedBoard: Table<DvonnPieceStack> = [
            [N, N, O, X, X, X, O, O, X, S, X],
            [N, X, X, O, O, O, X, X, O, X, X],
            [OX, X, X, X, O, S, X, O, O, O, O],
            [_, O, X, O, O, X, X, X, O, O, N],
            [O, S, O, X, X, O, O, O, X, N, N],
        ];
        const state: DvonnState = rules.node.gameState;
        const move: DvonnMove = DvonnMove.of(new Coord(0, 3), new Coord(0, 2));
        const expectedState: DvonnState = new DvonnState(expectedBoard, 1, false);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const stack: DvonnPieceStack = expectedState.getPieceAt(new Coord(0, 2));
        expect(stack.belongsTo(Player.ZERO)).toBeTrue();
    });
    it('should allow moves only to occupied spaces', () => {
        const board: Table<DvonnPieceStack> = [
            [N, N, O, X, _, X, O, _, X, S, X],
            [N, X, X, O, O, O, X, X, O, X, X],
            [X, X, X, _, O, S, _, O, O, O, O],
            [O, _, X, O, O, _, X, X, O, O, N],
            [O, S, O, X, X, O, O, O, X, N, N],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);
        const moves: DvonnMove[] = minimaxes[0].getListMoves(new DvonnNode(state));
        for (const move of moves) {
            expect(state.getPieceAt(move.end).isEmpty()).toBeFalse();
        }
        const move: DvonnMove = DvonnMove.of(new Coord(3, 1), new Coord(3, 2));
        RulesUtils.expectMoveFailure(rules, state, move, DvonnFailure.EMPTY_TARGET_STACK());
    });
    it('should move stacks as a whole, by as many spaces as there are pieces in the stack', () => {
        const board: Table<DvonnPieceStack> = [
            [N, N, OO, X, _, _, _, _, _, _, _],
            [N, OOO, XS, O, O, _, _, S, _, _, _],
            [XX, X, X, _, O, _, _, XX, _, _, _],
            [O, _, X, OOO, O, _, _, _, _, _, N],
            [O, S, O, X, X, O, _, _, _, N, N],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);
        const moves: DvonnMove[] = minimaxes[0].getListMoves(new DvonnNode(state));
        for (const move of moves) {
            expect(move.length()).toEqual(state.getPieceAt(move.coord).getSize());
        }
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(3, 0));
        RulesUtils.expectMoveFailure(rules, state, move, DvonnFailure.INVALID_MOVE_LENGTH());
    });
    it('should not allow moves that end on an empty space', () => {
        const board: Table<DvonnPieceStack> = [
            [N, N, OO, X, _, _, _, _, _, _, _],
            [N, OOO, XS, O, O, _, _, S, _, _, _],
            [XX, X, X, _, O, _, _, XX, _, _, _],
            [O, _, X, OOO, O, _, _, _, _, _, N],
            [O, S, O, X, X, O, _, _, _, N, N],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);
        const moves: DvonnMove[] = minimaxes[0].getListMoves(new DvonnNode(state));
        for (const move of moves) {
            expect(state.getPieceAt(move.end).isEmpty()).toBeFalse();
        }
    });
    it('should not allow to move a single red piece, but allows stacks with red pieces within it to move', () => {
        const board: Table<DvonnPieceStack> = [
            [N, N, OO, X, _, _, _, _, _, _, _],
            [N, OOO, XS, O, O, _, _, S, _, _, _],
            [XX, X, X, _, O, _, _, XX, _, _, _],
            [O, _, XSX, OOO, O, _, _, _, _, _, N],
            [O, S, O, X, X, O, _, _, _, N, N],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);
        const moves: DvonnMove[] = minimaxes[0].getListMoves(new DvonnNode( state));
        for (const move of moves) {
            const stack: DvonnPieceStack = state.getPieceAt(move.coord);
            // every movable piece should belong to the current player
            expect(stack.belongsTo(state.getCurrentPlayer())).toBeTrue();
        }
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(2, 4));
        RulesUtils.expectMoveFailure(rules, state, move, DvonnFailure.INVALID_MOVE_LENGTH());
    });
    it('should not allow to pass turns if moves are possible', () => {
        const state: DvonnState = rules.node.gameState;
        const move: DvonnMove = DvonnMove.PASS;
        RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.CANNOT_PASS());
    });
    it('should allow to pass turn if no moves are possible', () => {
        const board: Table<DvonnPieceStack> = [
            [N, N, OO, _, _, _, _, _, _, _, _],
            [N, _, S, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, _, _, N, N],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);
        const moves: DvonnMove[] = minimaxes[0].getListMoves(new DvonnNode(state));
        expect(moves.length).toEqual(1);
        expect(moves[0]).toEqual(DvonnMove.PASS);
        expect(rules.isLegal(DvonnMove.PASS, state).isSuccess()).toBeTrue();
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(2, 1));
        RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.MUST_PASS());
    });
    it('should remove of the board any portion disconnected from a source', () => {
        const board: Table<DvonnPieceStack> = [
            [N, N, OO, _, _, X, _, _, _, _, _],
            [N, _, S, O, O, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, _, _, N, N],
        ];
        const expectedBoard: Table<DvonnPieceStack> = [
            [N, N, OO, _, _, _, _, _, _, _, _],
            [N, _, OD, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, _, _, N, N],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);
        const move: DvonnMove = DvonnMove.of(new Coord(3, 1), new Coord(2, 1));
        const expectedState: DvonnState = new DvonnState(expectedBoard, 1, false);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should end the game when no move can be done', () => {
        const board: Table<DvonnPieceStack> = [
            [N, N, OO, _, _, _, _, _, _, _, _],
            [N, _, S, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, _, _, N, N],
        ];
        const state: DvonnState = new DvonnState(board, 10, true);
        const node: DvonnNode = new DvonnNode(state, MGPOptional.empty(), MGPOptional.of(DvonnMove.PASS));
        expect(minimaxes[0].getListMoves(node).length).toEqual(0);
    });
    it('should not end if moves can be done', () => {
        const board: Table<DvonnPieceStack> = [
            [N, N, _, _, _, _, _, _, _, XS6, _],
            [N, _, _, X6, OO, _, X5, _, _, _, _],
            [_, _, _, _, O, XS6, O6, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, N],
            [_, OS6, _, _, _, _, _, _, _, N, N],
        ];
        const state: DvonnState = new DvonnState(board, 11, true);
        const move: DvonnMove = DvonnMove.of(new Coord(1, 3), new Coord(1, 4));
        const node: DvonnNode = new DvonnNode(state,
                                              MGPOptional.empty(),
                                              MGPOptional.of(move));
        expect(minimaxes[0].getListMoves(node).length).toEqual(1);
    });
    describe('endgames', () => {
        it('should recognize victory for player zero', () => {
            const board: Table<DvonnPieceStack> = [
                [N, N, OO, _, _, _, _, _, _, _, _],
                [N, _, S, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
            ];
            const state: DvonnState = new DvonnState(board, 0, false);
            const node: DvonnNode = new DvonnNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
        it('should recognize victory for player one', () => {
            const board: Table<DvonnPieceStack> = [
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, S, XX, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
            ];
            const state: DvonnState = new DvonnState(board, 0, false);
            const node: DvonnNode = new DvonnNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
        it('should recognize draw', () => {
            const board: Table<DvonnPieceStack> = [
                [N, N, _, OO, _, _, _, _, _, _, _],
                [N, _, S, XX, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
            ];
            const state: DvonnState = new DvonnState(board, 0, false);
            const node: DvonnNode = new DvonnNode(state);
            RulesUtils.expectToBeDraw(rules, node, minimaxes);
        });
    });
    describe('isMovablePiece', () => {
        it('should fail if the coord is not on the board', () => {
            expect(() => rules.isMovablePiece(DvonnState.getInitialState(), new Coord(-1, -1)))
                .toThrowError('Assertion failure: piece is not on the board');
        });
    });
});
