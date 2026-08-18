/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { EmptyRulesConfig } from '../../../config/RulesConfigUtil';
import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { Coord } from '../../../jscaip/Coord';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { Player } from '../../../jscaip/Player';
import { SaharaMobilityHeuristic } from '../SaharaMobilityHeuristic';
import { SaharaRules } from '../SaharaRules';
import { SaharaState } from '../SaharaState';

describe('SaharaMobilityHeuristic', () => {

    let heuristic: SaharaMobilityHeuristic;
    const defaultConfig: EmptyRulesConfig = SaharaRules.get().getDefaultRulesConfig();

    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const _: FourStatePiece = FourStatePiece.EMPTY;

    beforeEach(() => {
        heuristic = new SaharaMobilityHeuristic(SaharaRules.get());
    });

    describe('Behavior Tests', () => {

        it(`should prefer to surround ennemy than to have it free`, () => {
            // In this board Player.ZERO surround one piece
            const weakBoard: FourStatePiece[][] = [
                [N, N, _, _, _, O, _, X, _, N, N],
                [N, _, O, _, O, _, _, _, _, X, N],
                [_, _, _, _, _, _, _, _, _, _, _],
                [O, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, X, N],
                [N, N, O, X, _, _, _, O, X, N, N],
            ];
            const weakState: SaharaState = new SaharaState(weakBoard, 1);
            // In this board, freedoms are the exact same, but the piece is not surrounded
            const strongBoard: FourStatePiece[][] = [
                [N, N, _, X, _, O, _, _, _, N, N],
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

    });

    describe('countMovesToClosestAlly', () => {

        it('should count pieces that are one step away from another as one', () => {
            const board: FourStatePiece[][] = [
                [N, N, O, _, _, _, X, _, O, N, N],
                [N, _, O, _, _, _, X, _, O, _, N],
                [_, _, _, _, _, _, X, _, O, _, _],
                [_, _, _, _, _, _, X, _, O, _, _],
                [N, _, _, _, _, _, X, _, _, _, N],
                [N, N, _, _, _, _, X, _, _, N, N],
            ];
            const state: SaharaState = new SaharaState(board, 0);
            const coordUnderTest: Coord = new Coord(2, 0);
            expect(heuristic.countMovesToClosestAlly(state, coordUnderTest)).toBe(1);
        });

        it('should count pieces that are unable to reach ally as Number.POSITIVE_INFINITY', () => {
            const board: FourStatePiece[][] = [
                [N, N, _, O, _, _, X, _, O, N, N],
                [N, _, _, _, _, _, X, _, O, _, N],
                [_, _, _, _, _, _, X, _, O, _, _],
                [_, _, _, _, _, _, X, _, O, _, _],
                [N, _, _, _, _, _, X, _, O, _, N],
                [N, N, _, _, _, _, X, _, _, N, N],
            ];
            const state: SaharaState = new SaharaState(board, 0);
            const coordUnderTest: Coord = new Coord(3, 0);
            expect(heuristic.countMovesToClosestAlly(state, coordUnderTest)).toBe(Number.POSITIVE_INFINITY);
        });

        it('should count pieces that are one double step away from another as one', () => {
            const board: FourStatePiece[][] = [
                [N, N, _, O, _, O, X, _, O, N, N],
                [N, _, _, _, _, _, X, _, O, _, N],
                [_, _, _, _, _, _, X, _, O, _, _],
                [_, _, _, _, _, _, X, _, O, _, _],
                [N, _, _, _, _, _, X, _, _, _, N],
                [N, N, _, _, _, _, X, _, _, N, N],
            ];
            const state: SaharaState = new SaharaState(board, 0);
            const coordUnderTest: Coord = new Coord(3, 0);
            expect(heuristic.countMovesToClosestAlly(state, coordUnderTest)).toBe(1);
        });

        it('should count pieces that have one double step then one single to reach ally as two', () => {
            const board: FourStatePiece[][] = [
                [N, N, O, _, _, O, X, _, O, N, N],
                [N, _, _, _, _, _, X, _, O, _, N],
                [_, _, _, _, _, _, X, _, O, _, _],
                [_, _, _, _, _, _, X, _, O, _, _],
                [N, _, _, _, _, _, X, _, _, _, N],
                [N, N, _, _, _, _, X, _, _, N, N],
            ];
            const state: SaharaState = new SaharaState(board, 0);
            const coordUnderTest: Coord = new Coord(2, 0);
            expect(heuristic.countMovesToClosestAlly(state, coordUnderTest)).toBe(2);
        });

    });

});
