import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { CoerceoMove, CoerceoStep } from '../CoerceoMove';
import { CoerceoState } from '../CoerceoState';
import { CoerceoFailure } from '../CoerceoFailure';
import { CoerceoNode, CoerceoRules } from '../CoerceoRules';
import { CoerceoMinimax } from '../CoerceoMinimax';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

describe('CoerceoRules', () => {

    let rules: CoerceoRules;

    let minimax: CoerceoMinimax;

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.NONE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;

    beforeEach(() => {
        rules = new CoerceoRules(CoerceoState);
        minimax = new CoerceoMinimax(rules, 'CoerceoMinimax');
    });
    describe('Deplacement', () => {
        it('Should forbid to start move from outside the board', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, [0, 0], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromDeplacement(new Coord(0, 0), CoerceoStep.RIGHT);
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.getReason()).toBe('Cannot start with a coord outside the board (0, 0).');
        });
        it('Should forbid to end move outside the board', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, [0, 0], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromDeplacement(new Coord(6, 6), CoerceoStep.LEFT);
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.getReason()).toBe('Cannot end with a coord outside the board (4, 6).');
        });
        it('Should forbid to move ppponent pieces', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, [0, 0], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromDeplacement(new Coord(6, 6), CoerceoStep.RIGHT);
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.getReason()).toBe(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        });
        it('Should forbid to move empty pieces', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, [0, 0], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromDeplacement(new Coord(7, 7), CoerceoStep.UP_RIGHT);
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.getReason()).toBe(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        });
        it('Should forbid to land on occupied piece', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, X, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, [0, 0], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromDeplacement(new Coord(6, 6), CoerceoStep.DOWN_RIGHT);
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.getReason()).toBe(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        });
        it('Should remove pieces captured by deplacement', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            ];
            const expectedBoard: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, X, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, [0, 0], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromDeplacement(new Coord(6, 6), CoerceoStep.DOWN_RIGHT);
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingState: CoerceoState = rules.applyLegalMove(move, state, status);
            const expectedState: CoerceoState =
                new CoerceoState(expectedBoard, 2, [0, 0], [0, 1]);
            expect(resultingState).toEqual(expectedState);
        });
        it('Should remove emptied tiles', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, X, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            ];
            const expectedBoard: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, [0, 0], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromDeplacement(new Coord(7, 5), CoerceoStep.DOWN_RIGHT);
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingState: CoerceoState = rules.applyLegalMove(move, state, status);
            const expectedState: CoerceoState =
                new CoerceoState(expectedBoard, 2, [0, 1], [0, 0]);
            expect(resultingState).toEqual(expectedState);
        });
        it('Should capture piece killed by tiles removal', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, _, O, _, N, N, N],
                [N, N, N, N, N, N, X, O, X, _, _, _, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            ];
            const expectedBoard: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, X, O, _, N, N, N],
                [N, N, N, N, N, N, X, _, X, _, _, _, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, [0, 0], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromDeplacement(new Coord(8, 6), CoerceoStep.DOWN_RIGHT);
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingState: CoerceoState = rules.applyLegalMove(move, state, status);
            const expectedState: CoerceoState =
                new CoerceoState(expectedBoard, 2, [0, 1], [0, 1]);
            expect(resultingState).toEqual(expectedState);
        });
    });
    describe('Tiles Exchange', () => {
        it(`Should forbid exchanges when player don't have enough tiles`, () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, [0, 0], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(6, 6));
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.getReason()).toBe(CoerceoFailure.NOT_ENOUGH_TILES_TO_EXCHANGE());
        });
        it('Should forbid capturing one own piece', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, [0, 2], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(6, 6));
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.getReason()).toBe(CoerceoFailure.CANNOT_CAPTURE_OWN_PIECES());
        });
        it('Should forbid capturing empty case', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, [0, 2], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(7, 7));
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.getReason()).toBe(CoerceoFailure.CANNOT_CAPTURE_FROM_EMPTY());
        });
        it('Should forbid capturing coord of removed tile', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, [0, 2], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(0, 0));
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.getReason()).toBe(CoerceoFailure.CANNOT_CAPTURE_FROM_EMPTY());
        });
        it('Should remove piece captured by tiles exchange, removing tile but no one win it', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, _, O, _, N, N, N],
                [N, N, N, N, N, N, X, _, _, _, _, _, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            ];
            const expectedBoard: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, [0, 2], [0, 0]);
            const move: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(10, 7));
            const status: LegalityStatus = rules.isLegal(move, state);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingState: CoerceoState = rules.applyLegalMove(move, state, status);
            const expectedState: CoerceoState =
                new CoerceoState(expectedBoard, 2, [0, 0], [0, 1]);
            expect(resultingState).toEqual(expectedState);
        });
    });
    it('Should not remove tiles emptied, when connected by 3 separated sides', () => {
        const board: FourStatePiece[][] = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, X, _, _],
            [N, N, N, N, N, N, N, N, N, _, O, _, O, _, _],
            [N, N, N, N, N, N, X, _, _, _, _, _, N, N, N],
            [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
        ];
        const expectedBoard: FourStatePiece[][] = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, X, _, _],
            [N, N, N, N, N, N, N, N, N, _, _, _, O, _, _],
            [N, N, N, N, N, N, X, _, _, _, _, _, N, N, N],
            [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
        ];
        const state: CoerceoState = new CoerceoState(board, 1, [0, 2], [0, 0]);
        const move: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(10, 7));
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: CoerceoState = rules.applyLegalMove(move, state, status);
        const expectedState: CoerceoState =
            new CoerceoState(expectedBoard, 2, [0, 0], [0, 1]);
        expect(resultingState).toEqual(expectedState);
    });
    describe('GetListMoves', () => {
        it('Should count correct number of moves', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, [2, 0], [0, 0]);
            const node: CoerceoNode = new MGPNode(null, null, state);
            expect(minimax.getListMoves(node).length).toBe(3);
        });
    });
    describe('GetBoardValue', () => {
        it('Should set minimal value to victory of Player.ZERO', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, [0, 0], [18, 17]);
            const node: CoerceoNode = new MGPNode(null, null, state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, [minimax]);
        });
        it('Should set minimal value to victory of Player.ONE', () => {
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, X, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, [0, 0], [17, 18]);
            const node: CoerceoNode = new MGPNode(null, null, state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, [minimax]);
        });
    });
});
