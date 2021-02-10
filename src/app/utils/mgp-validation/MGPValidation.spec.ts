import { MGPValidation } from './MGPValidation';

describe('MGPValidation', () => {
    it('Should not accept null reason', () => {
        expect(() => MGPValidation.failure(null)).toThrowError('MGPValidation.failure cannot be called with null.');
    });

    it('Should throw when asking MGPValidation.SUCCESS.getReason()', () => {
        expect(() => MGPValidation.SUCCESS.getReason()).toThrowError('MGPValidation: Cannot extract failure reason from success.');
    });
});
