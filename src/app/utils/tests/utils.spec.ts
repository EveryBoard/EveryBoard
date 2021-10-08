import { assert, display, isJSONPrimitive, Utils } from '../utils';

describe('utils', () => {

    describe('isJSONPrimitive', () => {
        it('should return true for all types of JSON primitives', () => {
            expect(isJSONPrimitive('foo')).toBeTrue();
            expect(isJSONPrimitive(42)).toBeTrue();
            expect(isJSONPrimitive(true)).toBeTrue();
            expect(isJSONPrimitive(null)).toBeTrue();
        });
        it('should return false for non-JSON primitives', () => {
            expect(isJSONPrimitive([1, 2, 3])).toBeFalse();
            expect(isJSONPrimitive({})).toBeFalse();
            expect(isJSONPrimitive(undefined)).toBeFalse(); // undefined is not valid in JSON!
        });
    });
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
