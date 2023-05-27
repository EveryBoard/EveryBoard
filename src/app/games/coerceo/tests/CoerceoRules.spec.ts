/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { CoerceoMove, CoerceoNormalMove, CoerceoStep, CoerceoTileExchangeMove } from '../CoerceoMove';
import { CoerceoState } from '../CoerceoState';
import { CoerceoFailure } from '../CoerceoFailure';
import { CoerceoNode, CoerceoRules } from '../CoerceoRules';
import { CoerceoMinimax } from '../CoerceoMinimax';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Minimax } from 'src/app/jscaip/Minimax';
import { CoerceoPiecesThreatTilesMinimax } from '../CoerceoPiecesThreatTilesMinimax';

describe('CoerceoRules', () => {

    let rules: CoerceoRules;

    let minimaxes: Minimax<CoerceoMove, CoerceoState>[];

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;

    beforeEach(() => {
        rules = CoerceoRules.get();
        minimaxes = [
            new CoerceoMinimax(rules, 'CoerceoMinimax'),
            new CoerceoPiecesThreatTilesMinimax(rules, 'CoerceoPiecesThreatTilesMinimax'),
        ];
    });
    describe('Deplacement', () => {
        it('should forbid to start move from outside the board', () => {
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
            const move: CoerceoMove = CoerceoNormalMove.fromMovement(new Coord(0, 0), CoerceoStep.RIGHT);
            function tryAStartingCoordOutOfRange(): void {
                rules.isLegal(move, state);
            }
            RulesUtils.expectToThrowAndLog(tryAStartingCoordOutOfRange, 'Cannot start with a coord outside the board (0, 0).');
        });
        it('should forbid to end move outside the board', () => {
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
            const move: CoerceoMove = CoerceoNormalMove.fromMovement(new Coord(6, 6), CoerceoStep.LEFT);
            function tryALandingingCoordOutOfRange(): void {
                rules.isLegal(move, state);
            }
            RulesUtils.expectToThrowAndLog(tryALandingingCoordOutOfRange, 'Cannot end with a coord outside the board (4, 6).');
        });
        it('should forbid to move ppponent pieces', () => {
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
            const move: CoerceoMove = CoerceoNormalMove.fromMovement(new Coord(6, 6), CoerceoStep.RIGHT);
            const reason: string = RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid to move empty pieces', () => {
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
            const move: CoerceoMove = CoerceoNormalMove.fromMovement(new Coord(7, 7), CoerceoStep.UP_RIGHT);
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid to land on occupied piece', () => {
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
            const move: CoerceoMove = CoerceoNormalMove.fromMovement(new Coord(6, 6), CoerceoStep.DOWN_RIGHT);
            const reason: string = RulesFailure.MUST_LAND_ON_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should remove pieces captured by movement', () => {
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
            const move: CoerceoMove = CoerceoNormalMove.fromMovement(new Coord(6, 6), CoerceoStep.DOWN_RIGHT);
            const expectedState: CoerceoState = new CoerceoState(expectedBoard, 2, [0, 0], [0, 1]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should remove emptied tiles', () => {
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
            const move: CoerceoMove = CoerceoNormalMove.fromMovement(new Coord(7, 5), CoerceoStep.DOWN_RIGHT);
            const expectedState: CoerceoState = new CoerceoState(expectedBoard, 2, [0, 1], [0, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should capture piece killed by tiles removal', () => {
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
            const move: CoerceoMove = CoerceoNormalMove.fromMovement(new Coord(8, 6), CoerceoStep.DOWN_RIGHT);
            const expectedState: CoerceoState = new CoerceoState(expectedBoard, 2, [0, 1], [0, 1]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
    });
    describe('Tiles Exchange', () => {
        it(`should forbid exchanges when player don't have enough tiles`, () => {
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
            const move: CoerceoMove = CoerceoTileExchangeMove.from(new Coord(6, 6)).get();
            const reason: string = CoerceoFailure.NOT_ENOUGH_TILES_TO_EXCHANGE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid capturing one own piece', () => {
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
            const move: CoerceoMove = CoerceoTileExchangeMove.from(new Coord(6, 6)).get();
            const reason: string = RulesFailure.CANNOT_SELF_CAPTURE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid capturing empty space', () => {
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
            const move: CoerceoMove = CoerceoTileExchangeMove.from(new Coord(7, 7)).get();
            const reason: string = CoerceoFailure.CANNOT_CAPTURE_FROM_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid capturing coord of removed tile', () => {
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
            const move: CoerceoMove = CoerceoTileExchangeMove.from(new Coord(0, 0)).get();
            const reason: string = CoerceoFailure.CANNOT_CAPTURE_FROM_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should remove piece captured by tiles exchange, removing tile but no one win it', () => {
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
            const move: CoerceoMove = CoerceoTileExchangeMove.from(new Coord(10, 7)).get();
            const expectedState: CoerceoState = new CoerceoState(expectedBoard, 2, [0, 0], [0, 1]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
    });
    it('should not remove tiles emptied, when connected by 3 separated sides', () => {
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
        const move: CoerceoMove = CoerceoTileExchangeMove.from(new Coord(10, 7)).get();
        const expectedState: CoerceoState = new CoerceoState(expectedBoard, 2, [0, 0], [0, 1]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    describe('GetBoardValue', () => {
        it('should set minimal value to victory of Player.ZERO', () => {
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
            const node: CoerceoNode = new CoerceoNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
        it('should set minimal value to victory of Player.ONE', () => {
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
            const node: CoerceoNode = new CoerceoNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
    });
});
