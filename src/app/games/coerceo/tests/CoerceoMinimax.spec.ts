import { NumberTable } from 'src/app/utils/ArrayUtils';
import { expectSecondStateToBeBetterThanFirst } from 'src/app/utils/tests/TestUtils.spec';
import { CoerceoPartSlice, CoerceoPiece } from '../CoerceoPartSlice';
import { CoerceoMinimax } from '../CoerceoMinimax';

describe('Coerceo - Minimax', () => {

    let minimax: CoerceoMinimax;

    const _: number = CoerceoPiece.EMPTY.value;
    const N: number = CoerceoPiece.NONE.value;
    const O: number = CoerceoPiece.ZERO.value;
    const X: number = CoerceoPiece.ONE.value;

    beforeEach(() => {
        minimax = new CoerceoMinimax('CoerceoMinimax');
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
