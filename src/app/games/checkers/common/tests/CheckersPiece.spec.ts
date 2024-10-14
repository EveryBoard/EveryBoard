import { CheckersPiece } from '../CheckersState';

fdescribe('CheckersPiece ', () => {

    const X: CheckersPiece = CheckersPiece.ONE_OFFICER;
    const O: CheckersPiece = CheckersPiece.ZERO_OFFICER;
    const v: CheckersPiece = CheckersPiece.ONE;
    const u: CheckersPiece = CheckersPiece.ZERO;

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
