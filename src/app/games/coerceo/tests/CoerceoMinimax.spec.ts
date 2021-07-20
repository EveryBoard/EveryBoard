import { NumberTable } from 'src/app/utils/ArrayUtils';
import { expectSecondStateToBeBetterThanFirst } from 'src/app/utils/tests/TestUtils.spec';
import { CoerceoPartSlice } from '../CoerceoPartSlice';
import { CoerceoMinimax } from '../CoerceoMinimax';
import { CoerceoRules } from '../CoerceoRules';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

describe('CoerceoMinimax', () => {

    let minimax: CoerceoMinimax;

    const _: number = FourStatePiece.EMPTY.value;
    const N: number = FourStatePiece.NONE.value;
    const O: number = FourStatePiece.ZERO.value;
    const X: number = FourStatePiece.ONE.value;

    beforeEach(() => {
        const rules: CoerceoRules = new CoerceoRules(CoerceoPartSlice);
        minimax = new CoerceoMinimax(rules, 'CoerceoMinimax');
    });
    it('Should prefer a board where he has more freedom', () => {
        const weakBoard: NumberTable = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, X, O, N, N, N, N, N, N],
        ];
        const weakState: CoerceoPartSlice = new CoerceoPartSlice(weakBoard, 0, [0, 0], [0, 0]);
        const strongBoard: NumberTable = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, X, O, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
        ];
        const strongState: CoerceoPartSlice = new CoerceoPartSlice(strongBoard, 0, [0, 0], [0, 0]);
        expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
});
