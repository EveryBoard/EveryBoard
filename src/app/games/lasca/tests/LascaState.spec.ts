import { LascaPiece, LascaStack, LascaState } from '../LascaState';

describe('LascaPiece ', () => {

    const X: LascaPiece = LascaPiece.ONE_OFFICER;
    const O: LascaPiece = LascaPiece.ZERO_OFFICER;
    const v: LascaPiece = LascaPiece.ONE;
    const u: LascaPiece = LascaPiece.ZERO;

    describe('toString', () => {

        it('should display officer piece as the player owning them and non officer as half of it', () => {
            expect(X.toString()).toBe('X');
            expect(O.toString()).toBe('O');
            expect(v.toString()).toBe('v');
            expect(u.toString()).toBe('u');
        });

    });

    describe('equal', () => {

        it('should work', () => {
            expect(X.equals(X)).toBeTrue();
            expect(X.equals(O)).toBeFalse();
        });

    });

});

describe('LascaState', () => {
    const zero: LascaPiece = LascaPiece.ZERO;
    const one: LascaPiece = LascaPiece.ONE;
    const zeroOfficer: LascaPiece = LascaPiece.ZERO_OFFICER;
    const oneOfficer: LascaPiece = LascaPiece.ONE_OFFICER;
    const __u: LascaStack = new LascaStack([zero]);
    const __O: LascaStack = new LascaStack([zeroOfficer]);
    const __v: LascaStack = new LascaStack([one]);
    const _vu: LascaStack = new LascaStack([one, zero]);
    const _uv: LascaStack = new LascaStack([zero, one]);
    const _Ov: LascaStack = new LascaStack([zeroOfficer, one]);
    const __X: LascaStack = new LascaStack([oneOfficer]);
    const ___: LascaStack = LascaStack.EMPTY;
    describe('toString', () => {

        it('should display state', () => {
            const state: LascaState = LascaState.of([
                [_uv, ___, __v, ___, __v, ___, __v],
                [___, _vu, ___, __v, ___, __v, ___],
                [_Ov, ___, __O, ___, __v, ___, __v],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, __u, ___, __u],
                [___, __X, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 0);
            const representation: string = `uv __ _v __ _v __ _v
__ vu __ _v __ _v __
Ov __ _O __ _v __ _v
__ __ __ __ __ __ __
__ __ __ __ _u __ _u
__ _X __ _u __ _u __
_u __ __ __ _u __ _u`;
            expect(state.toString()).toBe(representation);
        });

    });

});
