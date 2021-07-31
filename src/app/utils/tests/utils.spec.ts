import { assert, display, Utils } from '../utils';

describe('utils', () => {
    describe('display', () => {
        it('should log if verbose is true', () => {
            spyOn(console, 'log');
            display(true, 'foo');
            expect(console.log).toHaveBeenCalledTimes(1);
        });
        it('should not log if verbose is false', () => {
            spyOn(console, 'log');
            display(false, 'foo');
            expect(console.log).not.toHaveBeenCalled();
        });
    });
    describe('assert', () => {
        it('Should throw when condition is false', () => {
            expect(() => assert(false, 'error')).toThrowError('Assertion failure: error');
        });
    });
    describe('handleError', () => {
        it('should throw an error when called', () => {
            expect(() => Utils.handleError('error')).toThrowError('Encountered error: error');
        });
    });
});
