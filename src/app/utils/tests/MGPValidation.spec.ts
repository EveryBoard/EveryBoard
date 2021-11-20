import { MGPFallible } from '../MGPFallible';
import { MGPValidation } from '../MGPValidation';

describe('MGPValidation', () => {

    it('Should throw when asking MGPValidation.SUCCESS.getReason()', () => {
        const expectedError: string = 'MGPValidation: Cannot extract failure reason from success.';
        expect(() => MGPValidation.SUCCESS.getReason()).toThrowError(expectedError);
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
