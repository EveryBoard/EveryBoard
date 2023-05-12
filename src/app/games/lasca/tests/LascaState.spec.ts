import { LascaPiece } from '../LascaState';

describe('LascaPiece ', () => {

    const X: LascaPiece = LascaPiece.ONE_OFFICER;
    const O: LascaPiece = LascaPiece.ZERO_OFFICER;
    const v: LascaPiece = LascaPiece.ONE;
    const u: LascaPiece = LascaPiece.ZERO;

    describe('toString', () => {
        it('should displayed officer piece the the player owning them and non officer like half of it', () => {
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
