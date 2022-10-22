/* eslint-disable max-lines-per-function */
import { EncapsuleNode, EncapsuleRules } from '../EncapsuleRules';
import { EncapsuleMinimax } from '../EncapsuleMinimax';
import { EncapsuleMove } from '../EncapsuleMove';
import { Coord } from 'src/app/jscaip/Coord';
import { EncapsuleCase, EncapsuleState } from '../EncapsuleState';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { EncapsulePiece } from '../EncapsulePiece';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { EncapsuleFailure } from '../EncapsuleFailure';
import { Minimax } from 'src/app/jscaip/Minimax';

describe('EncapsuleRules', () => {

    let rules: EncapsuleRules;

    let minimaxes: Minimax<EncapsuleMove, EncapsuleState, EncapsuleCase>[];

    const drop: (piece: EncapsulePiece, coord: Coord) => boolean = (piece: EncapsulePiece, coord: Coord) => {
        const move: EncapsuleMove = EncapsuleMove.fromDrop(piece, coord);
        return rules.choose(move);
    };
    const move: (start: Coord, end: Coord) => boolean = (start: Coord, end: Coord) => {
        const move: EncapsuleMove = EncapsuleMove.fromMove(start, end);
        return rules.choose(move);
    };
    const ___: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
    const X__: EncapsuleCase = new EncapsuleCase(Player.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
    const _X_: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ONE, PlayerOrNone.NONE);
    const __X: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, Player.ONE);
    const O__: EncapsuleCase = new EncapsuleCase(Player.ZERO, PlayerOrNone.NONE, PlayerOrNone.NONE);
    const _O_: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
    const __O: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, Player.ZERO);
    const XO_: EncapsuleCase = new EncapsuleCase(Player.ONE, Player.ZERO, PlayerOrNone.NONE);
    const O0: EncapsulePiece = EncapsulePiece.SMALL_DARK;
    const O1: EncapsulePiece = EncapsulePiece.MEDIUM_DARK;
    const O2: EncapsulePiece = EncapsulePiece.BIG_DARK;
    const X0: EncapsulePiece = EncapsulePiece.SMALL_LIGHT;
    const X1: EncapsulePiece = EncapsulePiece.MEDIUM_LIGHT;
    const X2: EncapsulePiece = EncapsulePiece.BIG_LIGHT;

    beforeEach(() => {
        rules = new EncapsuleRules(EncapsuleState);
        minimaxes = [
            new EncapsuleMinimax(rules, 'EncapsuleMinimax'),
        ];
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    describe('isVictory', () => {
        it('should detect victory', () => {
            const board: EncapsuleCase[][] = [
                [O__, ___, ___],
                [___, _O_, ___],
                [___, ___, __O],
            ];
            const state: EncapsuleState = new EncapsuleState(board, 2, [
                X0, X0, X1, X1, X2, X2,
                O0, O1, O2,
            ]);
            expect(EncapsuleRules.isVictory(state).isPresent()).toBeTrue();
        });
        it('should not consider a non-victory as a victory', () => {
            const board: EncapsuleCase[][] = [
                [O__, ___, ___],
                [___, _X_, ___],
                [___, ___, __X],
            ];
            const state: EncapsuleState = new EncapsuleState(board, 2, [
                O0, O1, O1, O2, O2,
                X0, X0, X1, X2,
            ]);
            expect(EncapsuleRules.isVictory(state).isPresent()).toBeFalse();
            const node: EncapsuleNode = new EncapsuleNode(state);
            RulesUtils.expectToBeOngoing(rules, node, minimaxes);
        });
    });
    it('should know winner even when he was not playing', () => {
        // Given a board on which active player could loose by acting
        const board: EncapsuleCase[][] = [
            [XO_, ___, ___],
            [___, _X_, ___],
            [___, ___, __X],
        ];
        const state: EncapsuleState = new EncapsuleState(board, 2, [
            O0, O0, O1, O2, O2,
            X0, X1, X2,
        ]);

        // When doing that "actively loosing move"
        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 0), new Coord(1, 0));

        // Then the active player should have lost
        const expectedBoard: EncapsuleCase[][] = [
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
    it('should allow simplest victory for player zero', () => {
        expect(drop(EncapsulePiece.SMALL_DARK, new Coord(0, 0))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_LIGHT, new Coord(1, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_DARK, new Coord(1, 1))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_LIGHT, new Coord(0, 1))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_DARK, new Coord(2, 2))).toBeTrue();
        RulesUtils.expectToBeVictoryFor(rules, rules.node, Player.ZERO, minimaxes);
    });
    it('should allow simplest victory for player one', () => {
        expect(drop(EncapsulePiece.SMALL_DARK, new Coord(2, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_LIGHT, new Coord(0, 0))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_DARK, new Coord(1, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_LIGHT, new Coord(1, 1))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_DARK, new Coord(0, 1))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_LIGHT, new Coord(2, 2))).toBeTrue();
        RulesUtils.expectToBeVictoryFor(rules, rules.node, Player.ONE, minimaxes);
    });
    it('should allow moving pieces on empty coord', () => {
        // Given a board with piece on it
        const board: EncapsuleCase[][] = [
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
        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 0), new Coord(2, 2));

        // Then the piece should have been moved
        const expectedBoard: EncapsuleCase[][] = [
            [___, ___, ___],
            [___, X__, ___],
            [___, ___, O__],
        ];
        const expectedState: EncapsuleState = new EncapsuleState(expectedBoard, 3, remainingPieces);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should allow moving piece on a smaller piece', () => {
        // Given a board with small and bigger piece on it
        const board: EncapsuleCase[][] = [
            [_O_, ___, ___],
            [___, ___, ___],
            [___, ___, X__],
        ];
        const remainingPieces: EncapsulePiece[] = [X0, X1, X1, X2, X2, O0, O0, O1, O1, O2, O2];
        const state: EncapsuleState = new EncapsuleState(board, 2, remainingPieces);

        // When moving a single piece elsewhere
        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 0), new Coord(2, 2));

        // Then the piece should have been moved over the smaller one
        const expectedBoard: EncapsuleCase[][] = [
            [___, ___, ___],
            [___, ___, ___],
            [___, ___, XO_],
        ];
        const expectedState: EncapsuleState = new EncapsuleState(expectedBoard, 3, remainingPieces);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should forbid moving pieces on a piece with the same size', () => {
        expect(drop(EncapsulePiece.SMALL_DARK, new Coord(2, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_LIGHT, new Coord(2, 1))).toBeTrue();
        expect(move(new Coord(2, 0), new Coord(2, 1))).toBeFalse();
    });
    it('should forbid dropping a piece on a bigger piece', () => {
        const board: EncapsuleCase[][] = [
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
        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 0));
        RulesUtils.expectMoveFailure(rules, state, move, EncapsuleFailure.INVALID_PLACEMENT());
    });
    it('should refuse to put three identical piece on the board', () => {
        expect(drop(EncapsulePiece.SMALL_DARK, new Coord(0, 0))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_LIGHT, new Coord(1, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_DARK, new Coord(1, 1))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_LIGHT, new Coord(0, 1))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_DARK, new Coord(2, 2))).toBeFalse();
    });
    it('should refuse to move small piece on bigger piece', () => {
        expect(drop(EncapsulePiece.SMALL_DARK, new Coord(0, 0))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_LIGHT, new Coord(1, 0))).toBeTrue();
        expect(move(new Coord(0, 0), new Coord(1, 0))).toBeFalse();
    });
    it('should refuse to move opponent piece on the board', () => {
        expect(drop(EncapsulePiece.SMALL_DARK, new Coord(0, 0))).toBeTrue();
        expect(move(new Coord(0, 0), new Coord(1, 0))).toBeFalse();
    });
    it('should refuse to move or drop void', () => {
        expect(drop(EncapsulePiece.NONE, new Coord(0, 0))).toBeFalse();
        expect(move(new Coord(0, 0), new Coord(1, 0))).toBeFalse();
    });
});
