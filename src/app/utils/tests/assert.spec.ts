/* eslint-disable max-lines-per-function */
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { assert } from '../assert';

describe('assert', () => {
    it('should log error and throw when condition is false', () => {
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        expect(() => assert(false, 'error')).toThrowError('Assertion failure: error');
        expect(ErrorLoggerService.logError).toHaveBeenCalledWith('Assertion failure', 'error');
    });
});
