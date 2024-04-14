/* eslint-disable max-lines-per-function */
import { MathUtils } from '../MathUtils';

describe('MathUtils', () => {

    describe('gcd', () => {
        it('should compute the expected gcd', () => {
            expect(MathUtils.gcd(5, 3)).toBe(1);
            expect(MathUtils.gcd(15, 3)).toBe(3);
            expect(MathUtils.gcd(3, 15)).toBe(3);
        });

        it('should compute a positive gcd when used with negative numbers', () => {
            expect(MathUtils.gcd(-5, 3)).toBe(1);
            expect(MathUtils.gcd(-15, 3)).toBe(3);
            expect(MathUtils.gcd(15, -3)).toBe(3);
        });
    });

});
