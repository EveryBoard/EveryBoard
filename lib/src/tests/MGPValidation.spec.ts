/* eslint-disable max-lines-per-function */
import { MGPFallible } from '../MGPFallible';
import { MGPValidation } from '../MGPValidation';

export class MGPValidationTestUtils {

    public static expectToBeSuccess(fallible: MGPValidation): void {
        expect(fallible.isSuccess()).toBeTrue();
    }

    public static expectToBeFailure(fallible: MGPValidation, reason: string): void {
        expect(fallible.isFailure()).toBeTrue();
        expect(fallible.getReason()).toBe(reason);
    }
}

describe('MGPValidation', () => {

    it('should throw when asking MGPValidation.SUCCESS.getReason()', () => {
        const expectedError: string = 'Cannot get failure reason from a success';
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
    it('should construct a failure with MGPValidation.failure', () => {
        expect(MGPValidation.failure('error').isFailure()).toBeTrue();
    });
});
