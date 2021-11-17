import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { SaharaMinimax } from '../SaharaMinimax';
import { SaharaState } from '../SaharaState';
import { SaharaRules } from '../SaharaRules';

describe('SaharaMinimax', () => {

    let minimax: SaharaMinimax;
    let rules: SaharaRules;

    const N: FourStatePiece = FourStatePiece.NONE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const _: FourStatePiece = FourStatePiece.EMPTY;

    beforeEach(() => {
        rules = new SaharaRules(SaharaState);
        minimax = new SaharaMinimax(rules, 'SaharaMinimax');
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
        const weakState: SaharaState = new SaharaState(weakBoard, 0);
        const strongBoard: FourStatePiece[][] = [
            [N, N, _, O, X, _, _, O, X, N, N],
            [N, _, _, _, _, _, _, _, _, _, N],
            [X, _, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, _, _, _, N],
            [N, N, X, O, _, _, _, X, O, N, N],
        ];
        const strongState: SaharaState = new SaharaState(strongBoard, 0);
        RulesUtils.expectSecondStateToBeBetterThanFirst(weakState, null, strongState, null, minimax);
    });
});
