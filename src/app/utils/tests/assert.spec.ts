/* eslint-disable max-lines-per-function */
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { assert } from '../assert';

describe('assert', () => {
    it('Should log error and throw when condition is false', () => {
        spyOn(ErrorLoggerService, 'logError');
        expect(() => assert(false, 'error')).toThrowError('Assertion failure: error');
        expect(ErrorLoggerService.logError).toHaveBeenCalledWith('Assertion failure', 'error');
    });
});
