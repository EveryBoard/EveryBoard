/* eslint-disable max-lines-per-function */
import { MGPFallible } from '../MGPFallible';
import { MGPValidation } from '../MGPValidation';

describe('MGPValidation', () => {

    it('should throw when asking MGPValidation.SUCCESS.getReason()', () => {
        const expectedError: string = 'MGPValidation: Cannot extract failure reason from success.';
        expect(() => MGPValidation.SUCCESS.getReason()).toThrowError(expectedError);
    });
    describe('ofFallible', () => {
        it('should return MGPValidation.SUCCESS when given a success', () => {
            // Given a successful MGPFallible
            const fallible: MGPFallible<number> = MGPFallible.success(42);

            // When converting it to a MGPValidation
            const validation: MGPValidation = MGPValidation.ofFallible(fallible);

            // Then it should be MGPValidation.SUCCESS
            expect(validation).toBe(MGPValidation.SUCCESS);
        });
    });
    describe('toFailedFallible', () => {
        it('should convert to fallible if it is a failure', () => {
            expect(MGPValidation.failure('foo').toFailedFallible()).toEqual(MGPFallible.failure('foo'));
        });
        it('should fail when converting a success', () => {
            expect(() => MGPValidation.SUCCESS.toFailedFallible()).toThrowError('MGPValidation: cannot convert into failed fallible.');
        });
    });
});
