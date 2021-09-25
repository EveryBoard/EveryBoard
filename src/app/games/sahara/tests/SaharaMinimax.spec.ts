import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { expectSecondStateToBeBetterThanFirst } from 'src/app/utils/tests/TestUtils.spec';
import { SaharaMinimax } from '../SaharaMinimax';
import { SaharaState } from '../SaharaState';
import { SaharaRules } from '../SaharaRules';

describe('SaharaMinimax', () => {

    let minimax: SaharaMinimax;
    let rules: SaharaRules;

    const N: number = FourStatePiece.NONE.value;
    const O: number = FourStatePiece.ZERO.value;
    const X: number = FourStatePiece.ONE.value;
    const _: number = FourStatePiece.EMPTY.value;

    beforeEach(() => {
        rules = new SaharaRules(SaharaState);
        minimax = new SaharaMinimax(rules, 'SaharaMinimax');
    });
    it('should prefer having more freedoms', () => {
        const weakBoard: number[][] = [
            [N, N, O, X, _, _, _, O, X, N, N],
            [N, _, _, _, _, _, _, _, _, _, N],
            [X, _, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, _, _, _, N],
            [N, N, X, O, _, _, _, X, O, N, N],
        ];
        const weakState: SaharaState = new SaharaState(weakBoard, 0);
        const strongBoard: number[][] = [
            [N, N, _, O, X, _, _, O, X, N, N],
            [N, _, _, _, _, _, _, _, _, _, N],
            [X, _, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, _, _, _, N],
            [N, N, X, O, _, _, _, X, O, N, N],
        ];
        const strongState: SaharaState = new SaharaState(strongBoard, 0);
        expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
});
