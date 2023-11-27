/* eslint-disable max-lines-per-function */
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { SaharaState } from '../SaharaState';
import { MGPOptional } from '@everyboard/lib';
import { Player } from 'src/app/jscaip/Player';
import { SaharaHeuristic } from '../SaharaHeuristic';

describe('SaharaTeuristic', () => {

    let heuristic: SaharaHeuristic;

    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const _: FourStatePiece = FourStatePiece.EMPTY;

    beforeEach(() => {
        heuristic = new SaharaHeuristic();
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
                                                               Player.ONE);
    });
});
