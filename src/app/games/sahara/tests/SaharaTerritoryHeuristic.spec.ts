/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { BoardData } from '../../../jscaip/BoardData';
import { Coord } from '../../../jscaip/Coord';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { Player } from '../../../jscaip/Player';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';
import { SaharaRules } from '../SaharaRules';
import { SaharaState } from '../SaharaState';
import { SaharaTerritoryHeuristic } from '../SaharaTerritoryHeuristic';

describe('SaharaTerritoryHeuristic', () => {

    let heuristic: SaharaTerritoryHeuristic;
    const defaultConfig: NoConfig = SaharaRules.get().getDefaultRulesConfig();

    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const _: FourStatePiece = FourStatePiece.EMPTY;

    beforeEach(() => {
        heuristic = new SaharaTerritoryHeuristic();
    });

    describe('Behavior Tests', () => {

        it(`should (at equal freedom repartition) prefer to surround ennemy than to have it free`, () => {
            // In this board Player.ZERO surround one piece
            const weakBoard: FourStatePiece[][] = [
                [N, N, _, X, _, O, _, _, _, N, N],
                [N, _, O, _, O, _, _, _, _, X, N],
                [_, _, _, _, _, _, _, _, _, _, _],
                [O, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, X, N],
                [N, N, O, X, _, _, _, O, X, N, N],
            ];
            const weakState: SaharaState = new SaharaState(weakBoard, 1);
            // In this board, freedoms are the exact same, but the piece is not surrounded
            const strongBoard: FourStatePiece[][] = [
                [N, N, _, _, _, O, _, X, _, N, N],
                [N, _, O, _, O, _, _, _, _, X, N],
                [_, _, _, _, _, _, _, _, _, _, _],
                [O, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, X, N],
                [N, N, O, X, _, _, _, O, X, N, N],
            ];
            const strongState: SaharaState = new SaharaState(strongBoard, 1);
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ZERO,
                                                                   defaultConfig);
        });

        it(`should consider piece that are surrounded but form a mutual protection not dead`, () => {
            // In this board Player.ZERO surround two pieces, but they protect each other, so they are not dead
            const weakBoard: FourStatePiece[][] = [
                [N, N, _, X, _, O, _, _, _, N, N],
                [N, _, X, _, O, _, _, _, _, X, N],
                [_, O, _, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, _, N],
                [N, N, O, X, _, _, _, O, X, N, N],
            ];
            const weakState: SaharaState = new SaharaState(weakBoard, 1);
            // In this board, freedoms are the exact same, but the pieces are not surrounded,
            // but it's of equivalent value
            const strongBoard: FourStatePiece[][] = [
                [N, N, _, _, _, O, _, X, _, N, N],
                [N, _, _, _, O, _, _, X, _, X, N],
                [_, O, _, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, _, N],
                [N, N, O, X, _, _, _, O, X, N, N],
            ];
            const strongState: SaharaState = new SaharaState(strongBoard, 1);
            HeuristicUtils.expectStatesToBeOfEqualValue(heuristic,
                                                        weakState,
                                                        strongState,
                                                        defaultConfig);
        });

        it('should prefer having more freedoms', () => {
            const weakBoard: FourStatePiece[][] = [
                [N, N, O, X, _, _, _, O, X, N, N],
                [N, _, _, _, _, _, _, _, _, _, N],
                [X, _, _, _, _, _, _, _, _, _, O],
                [O, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, _, N],
                [N, N, X, O, _, _, _, X, O, N, N],
            ];
            const weakState: SaharaState = new SaharaState(weakBoard, 1);
            const strongBoard: FourStatePiece[][] = [
                [N, N, _, O, X, _, _, O, X, N, N],
                [N, _, _, _, _, _, _, _, _, _, N],
                [X, _, _, _, _, _, _, _, _, _, O],
                [O, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, _, N],
                [N, N, X, O, _, _, _, X, O, N, N],
            ];
            const strongState: SaharaState = new SaharaState(strongBoard, 1);
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ONE,
                                                                   defaultConfig);
        });

    });

    describe('isSurrounded', () => {

        it('should consider as surronded a piece that has opponent pieces and edges around it', () => {
            const board: FourStatePiece[][] = [
                [N, N, O, X, X, _, _, _, _, N, N],
                [N, _, X, X, X, X, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, O, O, _, _, _, _, _, _, _],
                [N, _, O, O, _, _, _, _, _, _, N],
                [N, N, O, _, _, _, _, _, _, N, N],
            ];
            const state: SaharaState = new SaharaState(board, 0);
            const coordUnderTest: Coord = new Coord(2, 0);
            const boardData: BoardData = BoardData.ofBoard(state.getCopiedBoard(), heuristic.groupDataFactory);
            expect(heuristic.isSurrounded(state, coordUnderTest, boardData)).toBeTrue();
        });

        it('should consider as surronded a piece that has only opponent pieces around it', () => {
            const board: FourStatePiece[][] = [
                [N, N, _, O, X, O, _, _, _, N, N],
                [N, _, X, _, O, _, _, _, _, X, N],
                [_, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, _, N],
                [N, N, O, X, _, _, _, O, X, N, N],
            ];
            const state: SaharaState = new SaharaState(board, 0);
            const coordUnderTest: Coord = new Coord(4, 0);
            const boardData: BoardData = BoardData.ofBoard(state.getCopiedBoard(), heuristic.groupDataFactory);
            expect(heuristic.isSurrounded(state, coordUnderTest, boardData)).toBeTrue();
        });

        it('should consider as surronded a piece that has both opponent pieces around it and empty spaces connected to opponent', () => {
            const board: FourStatePiece[][] = [
                [N, N, O, X, _, O, _, _, _, N, N],
                [N, _, _, _, O, _, _, _, _, X, N],
                [_, O, X, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, _, N],
                [N, N, O, X, _, _, _, O, X, N, N],
            ];
            const state: SaharaState = new SaharaState(board, 0);
            const coordUnderTest: Coord = new Coord(3, 0);
            const boardData: BoardData = BoardData.ofBoard(state.getCopiedBoard(), heuristic.groupDataFactory);
            expect(heuristic.isSurrounded(state, coordUnderTest, boardData)).toBeTrue();
        });

        it('should consider as surronded a piece that has only empty spaces connected to opponent', () => {
            const board: FourStatePiece[][] = [
                [N, N, _, X, _, O, _, _, _, N, N],
                [N, _, O, _, O, _, _, _, _, X, N],
                [_, _, _, _, _, _, _, _, _, _, _],
                [O, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, X, N],
                [N, N, O, X, _, _, _, O, X, N, N],
            ];
            const state: SaharaState = new SaharaState(board, 0);
            const coordUnderTest: Coord = new Coord(3, 0);
            const boardData: BoardData = BoardData.ofBoard(state.getCopiedBoard(), heuristic.groupDataFactory);
            expect(heuristic.isSurrounded(state, coordUnderTest, boardData)).toBeTrue();
        });

        it('should consider as surronded a pair of pieces that have both opponent pieces around it and empty spaces connected to opponent', () => {
            const board: FourStatePiece[][] = [
                [N, N, X, X, _, O, _, _, _, N, N],
                [N, _, O, _, O, _, _, _, _, X, N],
                [_, O, _, _, _, _, _, _, _, _, _],
                [_, _, X, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, _, N],
                [N, N, O, X, _, _, _, O, X, N, N],
            ];
            const state: SaharaState = new SaharaState(board, 0);
            const coordUnderTest: Coord = new Coord(2, 0);
            const boardData: BoardData = BoardData.ofBoard(state.getCopiedBoard(), heuristic.groupDataFactory);
            expect(heuristic.isSurrounded(state, coordUnderTest, boardData)).toBeTrue();
        });

        it('should not consider as surronded a piece that is surrounded only by empty spaces that are themselves surrounded by different allies', () => {
            const board: FourStatePiece[][] = [
                [N, N, X, X, _, O, _, _, _, N, N],
                [N, _, O, _, O, _, _, _, _, X, N],
                [_, O, _, _, _, _, _, _, _, _, _],
                [_, _, X, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, _, N],
                [N, N, O, X, _, _, _, O, X, N, N],
            ];
            const state: SaharaState = new SaharaState(board, 0);
            const coordUnderTest: Coord = new Coord(5, 0);
            const boardData: BoardData = BoardData.ofBoard(state.getCopiedBoard(), heuristic.groupDataFactory);
            expect(heuristic.isSurrounded(state, coordUnderTest, boardData)).toBeFalse();
        });

        it('should not consider as surronded a piece that is surrounded only by empty spaces that are themselves surrounded by different allies, but far away', () => {
            const board: FourStatePiece[][] = [
                [N, N, _, X, _, O, _, _, _, N, N],
                [N, _, O, _, O, _, _, _, _, X, N],
                [_, _, _, _, _, _, _, _, _, _, _],
                [O, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, X, N],
                [N, N, O, X, _, _, _, O, X, N, N],
            ];
            const state: SaharaState = new SaharaState(board, 0);
            const coordUnderTest: Coord = new Coord(0, 3);
            const boardData: BoardData = BoardData.ofBoard(state.getCopiedBoard(), heuristic.groupDataFactory);
            expect(heuristic.isSurrounded(state, coordUnderTest, boardData)).toBeFalse();
        });

    });

});
