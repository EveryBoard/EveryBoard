import { MGPValidation } from '../MGPValidation';

describe('MGPValidation', () => {

    it('Should throw when asking MGPValidation.SUCCESS.getReason()', () => {
        const expectedError: string = 'MGPValidation: Cannot extract failure reason from success.';
        expect(() => MGPValidation.SUCCESS.getReason()).toThrowError(expectedError);
    });
});
