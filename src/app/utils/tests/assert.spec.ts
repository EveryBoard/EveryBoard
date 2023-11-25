/* eslint-disable max-lines-per-function */
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { assert } from '../assert';

describe('Assert', () => {
    it('should log error and throw when condition is false', () => {
        // Given the assert function at any moment
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

        // When calling it with a false and an error message
        expect(() => assert(false, 'error')).toThrowError('Assertion failure: error');

        // Then ErrorLoggerService.logError should have been called
        expect(ErrorLoggerService.logError).toHaveBeenCalledWith('Assertion failure', 'error');
    });
    it('should console.log the second parameter when provided', () => {
        // Given the assert function at any moment
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        spyOn(console, 'log').and.returnValue();

        // When calling it with a false and an error message and a second parameter of any type
        expect(() => assert(false, 'error', ['1', '2'])).toThrowError('Assertion failure: error');

        // Then ErrorLoggerService.logError should have been called as well as console.log
        expect(ErrorLoggerService.logError).toHaveBeenCalledWith('Assertion failure', 'error');
        expect(console.log).toHaveBeenCalledOnceWith(['1', '2']);
    });
});
