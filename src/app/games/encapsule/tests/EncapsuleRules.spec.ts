/* eslint-disable max-lines-per-function */
import { EncapsuleNode, EncapsuleRules } from '../EncapsuleRules';
import { EncapsuleMinimax } from '../EncapsuleMinimax';
import { EncapsuleMove } from '../EncapsuleMove';
import { Coord } from 'src/app/jscaip/Coord';
import { EncapsuleSpace, EncapsuleState } from '../EncapsuleState';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { EncapsulePiece } from '../EncapsulePiece';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { EncapsuleFailure } from '../EncapsuleFailure';
import { Minimax } from 'src/app/jscaip/Minimax';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { GameConfig } from 'src/app/jscaip/ConfigUtil';

describe('EncapsuleRules', () => {

    let rules: EncapsuleRules;

    let minimaxes: Minimax<EncapsuleMove, EncapsuleState, GameConfig, EncapsuleSpace>[];

    let node: EncapsuleNode;

    const ___: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
    const X__: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
    const _X_: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.ONE, PlayerOrNone.NONE);
    const __X: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.ONE);
    const O__: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.ZERO, PlayerOrNone.NONE, PlayerOrNone.NONE);
    const _O_: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.ZERO, PlayerOrNone.NONE);
    const __O: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.ZERO);
    const XO_: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.ONE, PlayerOrNone.ZERO, PlayerOrNone.NONE);
    const O0: EncapsulePiece = EncapsulePiece.SMALL_DARK;
    const O1: EncapsulePiece = EncapsulePiece.MEDIUM_DARK;
    const O2: EncapsulePiece = EncapsulePiece.BIG_DARK;
    const X0: EncapsulePiece = EncapsulePiece.SMALL_LIGHT;
    const X1: EncapsulePiece = EncapsulePiece.MEDIUM_LIGHT;
    const X2: EncapsulePiece = EncapsulePiece.BIG_LIGHT;

    beforeEach(() => {
        rules = EncapsuleRules.get();
        minimaxes = [
            new EncapsuleMinimax(rules, 'EncapsuleMinimax'),
        ];
        node = rules.getInitialNode();
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('should detect victory', () => {
        // Given a board with three pieces owned by player zero in a row
        const board: EncapsuleSpace[][] = [
            [O__, ___, ___],
            [___, _O_, ___],
            [___, ___, __O],
        ];
        const state: EncapsuleState = new EncapsuleState(board, 2, [
            X0, X0, X1, X1, X2, X2,
            O0, O1, O2,
        ]);
        node = new EncapsuleNode(state);
        // When evaluating it
        // Then it should be a victory
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('should not consider a non-victory as a victory', () => {
        // Given a board that is an ongoing part
        const board: EncapsuleSpace[][] = [
            [O__, ___, ___],
            [___, _X_, ___],
            [___, ___, __X],
        ];
        const state: EncapsuleState = new EncapsuleState(board, 2, [
            O0, O1, O1, O2, O2,
            X0, X0, X1, X2,
        ]);
        node = new EncapsuleNode(state);

        // When evaluating it
        // Then it should be considered as ongoing
        RulesUtils.expectToBeOngoing(rules, node, minimaxes);
    });
    it('should know winner even when he was not playing', () => {
        // Given a board on which active player could lose by acting
        const board: EncapsuleSpace[][] = [
            [XO_, ___, ___],
            [___, _X_, ___],
            [___, ___, __X],
        ];
        const state: EncapsuleState = new EncapsuleState(board, 2, [
            O0, O0, O1, O2, O2,
            X0, X1, X2,
        ]);

        // When doing that "actively losing move"
        const move: EncapsuleMove = EncapsuleMove.ofMove(new Coord(0, 0), new Coord(1, 0));

        // Then the active player should have lost
        const expectedBoard: EncapsuleSpace[][] = [
            [X__, _O_, ___],
            [___, _X_, ___],
            [___, ___, __X],
        ];
        const expectedState: EncapsuleState = new EncapsuleState(expectedBoard, 3, [
            O0, O0, O1, O2, O2,
            X0, X1, X2,
        ]);

        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const node: EncapsuleNode = new EncapsuleNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('should allow moving pieces on empty coord', () => {
        // Given a board with piece on it
        const board: EncapsuleSpace[][] = [
            [O__, ___, ___],
            [___, X__, ___],
            [___, ___, ___],
        ];
        const remainingPieces: EncapsulePiece[] = [
            X0, X1, X1, X2, X2,
            O0, O1, O1, O2, O2,
        ];
        const state: EncapsuleState = new EncapsuleState(board, 2, remainingPieces);

        // When moving a single piece elsewhere
        const move: EncapsuleMove = EncapsuleMove.ofMove(new Coord(0, 0), new Coord(2, 2));

        // Then the piece should have been moved
        const expectedBoard: EncapsuleSpace[][] = [
            [___, ___, ___],
            [___, X__, ___],
            [___, ___, O__],
        ];
        const expectedState: EncapsuleState = new EncapsuleState(expectedBoard, 3, remainingPieces);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should allow moving piece on a smaller piece', () => {
        // Given a board with small and bigger piece on it
        const board: EncapsuleSpace[][] = [
            [_O_, ___, ___],
            [___, ___, ___],
            [___, ___, X__],
        ];
        const remainingPieces: EncapsulePiece[] = [X0, X1, X1, X2, X2, O0, O0, O1, O1, O2, O2];
        const state: EncapsuleState = new EncapsuleState(board, 2, remainingPieces);

        // When moving a single piece elsewhere
        const move: EncapsuleMove = EncapsuleMove.ofMove(new Coord(0, 0), new Coord(2, 2));

        // Then the piece should have been moved over the smaller one
        const expectedBoard: EncapsuleSpace[][] = [
            [___, ___, ___],
            [___, ___, ___],
            [___, ___, XO_],
        ];
        const expectedState: EncapsuleState = new EncapsuleState(expectedBoard, 3, remainingPieces);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should forbid dropping pieces on a piece with the same size', () => {
        // Given a board with a piece already put
        const board: EncapsuleSpace[][] = [
            [O__, ___, ___],
            [___, ___, ___],
            [___, ___, ___],
        ];
        const state: EncapsuleState = new EncapsuleState(board, 2, [
            O0, O1, O1, O2, O2,
            X0, X0, X1, X2,
        ]);
        // When trying to drop another piece of the same size
        const move: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 0));

        // Then it should be deemed illegal
        const reason: string = EncapsuleFailure.INVALID_PLACEMENT();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should forbid dropping a piece on a bigger piece', () => {
        const board: EncapsuleSpace[][] = [
            [__X, ___, ___],
            [___, ___, ___],
            [___, ___, ___],
        ];
        const state: EncapsuleState = new EncapsuleState(board, 2, [
            EncapsulePiece.SMALL_LIGHT, EncapsulePiece.SMALL_LIGHT,
            EncapsulePiece.MEDIUM_LIGHT, EncapsulePiece.MEDIUM_LIGHT,
            EncapsulePiece.BIG_LIGHT, EncapsulePiece.BIG_LIGHT,
            EncapsulePiece.SMALL_DARK, EncapsulePiece.MEDIUM_DARK,
            EncapsulePiece.BIG_DARK,
        ]);
        const move: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 0));
        const reason: string = EncapsuleFailure.INVALID_PLACEMENT();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should refuse to put three identical piece on the board', () => {
        // Given a board with no more SMALL_LIGHT available for drop
        const board: EncapsuleSpace[][] = [
            [O__, ___, ___],
            [___, _X_, ___],
            [___, ___, ___],
        ];
        const state: EncapsuleState = new EncapsuleState(board, 3, []);

        // When trying to drop one
        const move: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.SMALL_LIGHT, new Coord(2, 2));

        // Then it should be illegal
        const reason: string = EncapsuleFailure.PIECE_OUT_OF_STOCK();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should refuse to move small piece on bigger piece', () => {
        // Given a board with a big piece already put
        const board: EncapsuleSpace[][] = [
            [O__, ___, ___],
            [___, _X_, ___],
            [___, ___, ___],
        ];
        const state: EncapsuleState = new EncapsuleState(board, 2, [
            O0, O1, O1, O2, O2,
            X0, X0, X1, X2,
        ]);
        // When trying to put another piece on it
        const move: EncapsuleMove = EncapsuleMove.ofMove(new Coord(0, 0), new Coord(1, 1));

        // Then it should be deemed illegal
        const reason: string = EncapsuleFailure.INVALID_PLACEMENT();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should refuse to move opponent piece on the board', () => {
        // Given any board
        const state: EncapsuleState = EncapsuleState.getInitialState();

        // When trying to drop a piece of the opponent
        const move: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.SMALL_LIGHT, new Coord(2, 2));

        // Then it should be illegal
        const reason: string = RulesFailure.MUST_CHOOSE_PLAYER_PIECE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should refuse to drop nothing', () => {
        // Given any board
        const state: EncapsuleState = EncapsuleState.getInitialState();

        // When trying to drop "nothing"
        const move: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.NONE, new Coord(2, 2));

        // Then it should be illegal
        const reason: string = RulesFailure.MUST_CHOOSE_PLAYER_PIECE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should refuse to move empty space', () => {
        // Given any board
        const state: EncapsuleState = EncapsuleState.getInitialState();

        // When trying to drop "nothing"
        const move: EncapsuleMove = EncapsuleMove.ofMove(new Coord(1, 1), new Coord(2, 2));

        // Then it should be illegal
        const reason: string = RulesFailure.MUST_CHOOSE_PLAYER_PIECE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
});
