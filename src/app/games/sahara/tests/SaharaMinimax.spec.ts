import { expectSecondStateToBeBetterThanFirst } from 'src/app/utils/tests/TestUtils.spec';
import { SaharaMinimax } from '../SaharaMinimax';
import { SaharaPartSlice } from '../SaharaPartSlice';
import { SaharaPawn } from '../SaharaPawn';
import { SaharaRules } from '../SaharaRules';

describe('SaharaMinimax', () => {

    let minimax: SaharaMinimax;
    let rules: SaharaRules;

    const N: number = SaharaPawn.NONE;
    const O: number = SaharaPawn.BLACK;
    const X: number = SaharaPawn.WHITE;
    const _: number = SaharaPawn.EMPTY;

    beforeEach(() => {
        rules = new SaharaRules(SaharaPartSlice);
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
        const weakState: SaharaPartSlice = new SaharaPartSlice(weakBoard, 0);
        const strongBoard: number[][] = [
            [N, N, _, O, X, _, _, O, X, N, N],
            [N, _, _, _, _, _, _, _, _, _, N],
            [X, _, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, _, _, _, N],
            [N, N, X, O, _, _, _, X, O, N, N],
        ];
        const strongState: SaharaPartSlice = new SaharaPartSlice(strongBoard, 0);
        expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
});
