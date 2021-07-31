import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { expectToBeVictoryFor } from 'src/app/jscaip/tests/Rules.spec';
import { AbaloneDummyMinimax } from '../AbaloneDummyMinimax';
import { AbaloneFailure } from '../AbaloneFailure';
import { AbaloneGameState } from '../AbaloneGameState';
import { AbaloneMove } from '../AbaloneMove';
import { AbaloneLegalityStatus, AbaloneNode, AbaloneRules } from '../AbaloneRules';

describe('AbaloneRules', () => {

    const _: number = FourStatePiece.EMPTY.value;
    const N: number = FourStatePiece.NONE.value;
    const O: number = FourStatePiece.ZERO.value;
    const X: number = FourStatePiece.ONE.value;
    let rules: AbaloneRules;
    let minimaxes: Minimax<AbaloneMove, AbaloneGameState, AbaloneLegalityStatus>[];

    beforeEach(() => {
        rules = new AbaloneRules(AbaloneGameState);
        minimaxes = [
            new AbaloneDummyMinimax(rules, 'Dummy'),
        ];
    });
    it('should start with an ongoing board status', () => {
        const state: AbaloneGameState = AbaloneGameState.getInitialSlice();
        const node: AbaloneNode = new MGPNode(null, null, state);
        expect(rules.getGameStatus(node)).toBe(GameStatus.ONGOING);
    });
    it('should move simple piece in provided direction', () => {
        // Given an initial board (for simplicity)
        const state: AbaloneGameState = AbaloneGameState.getInitialSlice();

        // When moving one piece
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(0, 7), HexaDirection.UP);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);
        const resultingState: AbaloneGameState = rules.applyLegalMove(move, state, status);

        // Then the piece should be moved
        const expectedBoard: number[][] = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, X, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [O, _, O, O, O, _, _, N, N],
            [_, O, O, O, O, O, N, N, N],
            [O, O, O, O, O, N, N, N, N],
        ];
        const expectedState: AbaloneGameState = new AbaloneGameState(expectedBoard, 1);
        expect(status.legal.isSuccess()).toBeTrue();
        expect(resultingState).toEqual(expectedState);
    });
    it('should refuse move starting by enemy piece', () => {
        // Given an initial board (for simplicity)
        const state: AbaloneGameState = AbaloneGameState.getInitialSlice();

        // When moving one enemy piece
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(8, 1), HexaDirection.DOWN);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);

        // Then the movement should be refused
        expect(status.legal.reason).toBe(RulesFailure.CANNOT_CHOOSE_ENEMY_PIECE);
    });
    it('should refuse move starting by empty case', () => {
        // Given an initial board (for simplicity)
        const state: AbaloneGameState = AbaloneGameState.getInitialSlice();

        // When moving one empty case
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(4, 4), HexaDirection.DOWN);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);

        // Then the movement should be refused
        expect(status.legal.reason).toBe(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY);
    });
    it('should move group of piece in provided direction', () => {
        // Given an initial board (for simplicity)
        const state: AbaloneGameState = AbaloneGameState.getInitialSlice();

        // When moving one piece
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(0, 8), HexaDirection.UP);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);
        const resultingState: AbaloneGameState = rules.applyLegalMove(move, state, status);

        // Then the piece should be moved
        const expectedBoard: number[][] = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, X, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [O, _, O, O, O, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [_, O, O, O, O, N, N, N, N],
        ];
        const expectedState: AbaloneGameState = new AbaloneGameState(expectedBoard, 1);
        expect(status.legal.isSuccess()).toBeTrue();
        expect(resultingState).toEqual(expectedState);
    });
    it('should refuse moving group of piece greater than 3', () => {
        // Given a board with 4 piece aligned
        const board: number[][] = [
            [N, N, N, N, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, O, O, O, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [_, O, O, O, O, N, N, N, N],
        ];
        const state: AbaloneGameState = new AbaloneGameState(board, 0);

        // When moving four piece
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(1, 4), HexaDirection.RIGHT);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);

        // Then the move should be forbidden
        expect(status.legal.reason).toBe(AbaloneFailure.CANNOT_MOVE_MORE_THAN_THREE_PIECES);
    });
    it(`should refuse moving group of piece smaller than the enemy's group`, () => {
        // Given a board with 4 piece aligned
        const board: number[][] = [
            [N, N, N, N, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, O, X, X, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [_, O, O, O, O, N, N, N, N],
        ];
        const state: AbaloneGameState = new AbaloneGameState(board, 0);

        // When moving one piece against two
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(1, 4), HexaDirection.RIGHT);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);

        // Then the move should be forbidden
        expect(status.legal.reason).toBe(AbaloneFailure.NOT_ENOUGH_PIECE_TO_PUSH);
    });
    it('Should refuse moving a group of piece of equal size to the enemy', () => {
        // Given a board with 4 piece aligned
        const board: number[][] = [
            [N, N, N, N, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, O, O, X, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [_, O, O, O, O, N, N, N, N],
        ];
        const state: AbaloneGameState = new AbaloneGameState(board, 0);

        // When moving two pieces against two
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(1, 4), HexaDirection.RIGHT);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);

        // Then the move should be forbidden
        expect(status.legal.reason).toBe(AbaloneFailure.NOT_ENOUGH_PIECE_TO_PUSH);
    });
    it('Should refuse moving a group of piece when first piece after the enemy group is not empty', () => {
        // Given a board with possible push that is self-blocked
        const board: number[][] = [
            [N, N, N, N, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, O, O, O, X, O, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [_, O, O, O, O, N, N, N, N],
        ];
        const state: AbaloneGameState = new AbaloneGameState(board, 0);

        // When moving 3 pieces against 1 but then you're own piece block
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(1, 4), HexaDirection.RIGHT);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);

        // Then the move should be forbidden
        expect(status.legal.reason).toBe(AbaloneFailure.CANNOT_PUSH_YOUR_OWN_PIECES);
    });
    it('should make pushed piece get of the board', () => {
        // Given an board where 3 can push 1 out of 2 aligned pieces out of the board
        const board: number[][] = [
            [N, N, N, N, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _],
            [X, X, O, O, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [_, O, O, O, O, N, N, N, N],
        ];
        const state: AbaloneGameState = new AbaloneGameState(board, 0);

        // When pushing
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(4, 4), HexaDirection.LEFT);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);
        const resultingState: AbaloneGameState = rules.applyLegalMove(move, state, status);

        // Then the piece should be throwed out of the board
        const expectedBoard: number[][] = [
            [N, N, N, N, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _],
            [X, O, O, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [_, O, O, O, O, N, N, N, N],
        ];
        const expectedState: AbaloneGameState = new AbaloneGameState(expectedBoard, 1);
        expect(status.legal.isSuccess()).toBeTrue();
        expect(resultingState).toEqual(expectedState);
    });
    it('should declare player zero winner when he push a 6th enemy piece out of the board', () => {
        const winningBoard: number[][] = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, _, _, _, _, _, _],
            [N, N, _, _, X, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [O, O, O, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [O, O, O, O, O, N, N, N, N],
        ];
        const winningState: AbaloneGameState = new AbaloneGameState(winningBoard, 1);
        const node: AbaloneNode = new MGPNode(null, null, winningState);
        expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('should declare player one winner when he push a 6th enemy piece out of the board', () => {
        const winningBoard: number[][] = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _],
            [X, X, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, O, O, O, _, _, N, N],
            [_, _, _, _, _, _, N, N, N],
            [O, O, O, O, O, N, N, N, N],
        ];
        const winningState: AbaloneGameState = new AbaloneGameState(winningBoard, 1);
        const node: AbaloneNode = new MGPNode(null, null, winningState);
        expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('should allow unblocked translation', () => {
        // Given an initial board (for simplicity)
        const state: AbaloneGameState = AbaloneGameState.getInitialSlice();

        // When moving a 3 pieces column sideways
        const move: AbaloneMove = AbaloneMove.fromDoubleCoord(new Coord(2, 6), new Coord(4, 6), HexaDirection.UP);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);
        const resultingState: AbaloneGameState = rules.applyLegalMove(move, state, status);

        // Then the piece should be moved
        const expectedBoard: number[][] = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, X, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, O, O, O, _, _, _, N],
            [_, _, _, _, _, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [O, O, O, O, O, N, N, N, N],
        ];
        const expectedState: AbaloneGameState = new AbaloneGameState(expectedBoard, 1);
        expect(status.legal.isSuccess()).toBeTrue();
        expect(resultingState).toEqual(expectedState);
    });
    it('should refuse blocked translation', () => {
        // Given a board with possible blocked translation
        const board: number[][] = [
            [N, N, N, N, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, O, O, O, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [_, O, O, O, O, N, N, N, N],
        ];
        const state: AbaloneGameState = new AbaloneGameState(board, 0);

        // When trying to move 3 pieces down whilst there is a blocking piece in the middle
        const move: AbaloneMove = AbaloneMove.fromDoubleCoord(new Coord(1, 4),
                                                              new Coord(3, 4),
                                                              HexaDirection.DOWN);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);

        // Then the move should be forbidden
        expect(status.legal.reason).toBe(AbaloneFailure.TRANSLATION_IMPOSSIBLE);
    });
    it('should refuse to translate a group containing non player piece', () => {
        // Given a board with 2 aligned piece separated by a hole
        const board: number[][] = [
            [N, N, N, N, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, O, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [_, O, O, O, O, N, N, N, N],
        ];
        const state: AbaloneGameState = new AbaloneGameState(board, 0);

        // When trying to move 3 pieces down whilst there is a blocking piece in the middle
        const move: AbaloneMove = AbaloneMove.fromDoubleCoord(new Coord(1, 4),
                                                              new Coord(3, 4),
                                                              HexaDirection.DOWN);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);

        // Then the move should be forbidden
        expect(status.legal.reason).toBe(AbaloneFailure.MUST_ONLY_TRANSLATE_YOUR_PIECES);
    });
    it('Should push on NONE the same way as outside the array board', () => {
        // given initial state
        const state: AbaloneGameState = AbaloneGameState.getInitialSlice();

        // when moving a piece in one of the coord in the array but out of the board
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(4, 8), HexaDirection.RIGHT);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);
        const resultingState: AbaloneGameState = rules.applyLegalMove(move, state, status);

        // Then the piece should be moved
        const expectedBoard: number[][] = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, X, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, O, O, O, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [O, O, O, O, _, N, N, N, N],
        ];
        const expectedState: AbaloneGameState = new AbaloneGameState(expectedBoard, 1);
        expect(status.legal.isSuccess()).toBeTrue();
        expect(resultingState).toEqual(expectedState);
    });
    it('Should do sidestep landing on NONE the same way as outside the array board', () => {
        // given a state allowing to translate two piece, one of them going to NONE
        const board: number[][] = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, X, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, O, O, O, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [O, O, O, O, _, N, N, N, N],
        ];
        const state: AbaloneGameState = new AbaloneGameState(board, 0);

        // when moving a piece in one of the coord in the array but out of the board
        const move: AbaloneMove = AbaloneMove.fromDoubleCoord(new Coord(4, 7),
                                                              new Coord(5, 7),
                                                              HexaDirection.DOWN);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);
        const resultingState: AbaloneGameState = rules.applyLegalMove(move, state, status);

        // Then the piece should be moved
        const expectedBoard: number[][] = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, X, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, O, O, O, _, _, N, N],
            [O, O, O, O, _, _, N, N, N],
            [O, O, O, O, O, N, N, N, N],
        ];
        const expectedState: AbaloneGameState = new AbaloneGameState(expectedBoard, 1);
        expect(status.legal.isSuccess()).toBeTrue();
        expect(resultingState).toEqual(expectedState);
    });
    it('Should do sidestep landing outside the board correctly', () => {
        // given a state allowing to translate three pieces, one of them going outside the board
        const board: number[][] = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, X, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, O, O, O, _, _, N, N],
            [_, O, O, O, O, O, N, N, N],
            [O, O, O, O, O, N, N, N, N],
        ];
        const state: AbaloneGameState = new AbaloneGameState(board, 0);

        // when moving a piece in one of the coord in the array but out of the board
        const move: AbaloneMove = AbaloneMove.fromDoubleCoord(new Coord(2, 6),
                                                              new Coord(0, 8),
                                                              HexaDirection.LEFT);
        const status: AbaloneLegalityStatus = rules.isLegal(move, state);
        const resultingState: AbaloneGameState = rules.applyLegalMove(move, state, status);

        // Then the piece should be moved
        const expectedBoard: number[][] = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, X, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, O, _, O, O, _, _, N, N],
            [O, _, O, O, O, O, N, N, N],
            [_, O, O, O, O, N, N, N, N],
        ];
        const expectedState: AbaloneGameState = new AbaloneGameState(expectedBoard, 1);
        expect(status.legal.isSuccess()).toBeTrue();
        expect(resultingState).toEqual(expectedState);
    });
});
