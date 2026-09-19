/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { Player } from '../../../jscaip/Player';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic } from '../SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic';
import { SaharaRules } from '../SaharaRules';
import { SaharaState } from '../SaharaState';

describe('SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic', () => {

    let heuristic: SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic;
    const defaultConfig: EmptyRulesConfig = SaharaRules.get().getDefaultRulesConfig();

    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const _: FourStatePiece = FourStatePiece.EMPTY;

    beforeEach(() => {
        heuristic = new SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic(SaharaRules.get());
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

        it(`at equal number of surrounded ennemies, should prefer that surrounded ennemy than to have less freedom`, () => {
            // In this board Player.ZERO surround one piece
            const weakBoard: FourStatePiece[][] = [
                [N, N, _, O, _, X, _, _, _, N, N],
                [N, _, X, _, X, _, _, _, _, O, N],
                [_, _, _, _, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _, _, _, O],
                [N, _, _, _, _, _, _, _, _, O, N],
                [N, N, X, O, _, _, _, X, O, N, N],
            ];
            const weakState: SaharaState = new SaharaState(weakBoard, 1);
            // In this board, freedoms are the exact same, but the piece is not surrounded
            const strongBoard: FourStatePiece[][] = [
                [N, N, _, O, X, _, _, _, _, N, N],
                [N, _, X, _, X, _, _, _, _, O, N],
                [_, _, _, _, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _, _, _, O],
                [N, _, _, _, _, _, _, _, _, O, N],
                [N, N, X, O, _, _, _, X, O, N, N],
            ];
            const strongState: SaharaState = new SaharaState(strongBoard, 1);
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ONE,
                                                                   defaultConfig);
        });

        it(`should prefer to have more freedoms for other pieces (at equal number of freedoms for surrounded ennemies)`, () => {
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
                [N, N, _, _, _, O, _, X, _, N, N],
                [N, _, O, _, O, _, _, _, _, X, N],
                [_, _, _, _, _, _, _, _, _, _, _],
                [O, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, X, N],
                [N, N, O, X, _, _, O, _, X, N, N],
            ];
            const strongState: SaharaState = new SaharaState(strongBoard, 1);
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ZERO,
                                                                   defaultConfig);
        });

    });

});
