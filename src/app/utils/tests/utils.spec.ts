/* eslint-disable max-lines-per-function */
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
    describe('handleError', () => {
        it('should throw an error when called', () => {
            expect(() => Utils.handleError('error')).toThrowError('Encountered error: error');
        });
    });
    describe('expectToBe', () => {
        it('should fail when the default case has a different value than expected', () => {
            const value: number = 2;
            expect(() => {
                switch (value) {
                    case 0:
                        break;
                    default:
                        // we expect that value can only be 0 or 1
                        Utils.expectToBe(value, 1);
                        break;
                }
            }).toThrowError(`A default switch case did not observe the correct value, expected 1, but got 2 instead.`);
        });
        it('should use the message if it is passed', () => {
            expect(() => Utils.expectToBe(1, 2, 'message')).toThrowError('message');
        });
    });
    describe('expectToBeMultiple', () => {
        it('should fail when the default case has a different value than one of the expected values', () => {
            const value: number = 2;
            expect(() => {
                switch (value) {
                    default:
                        // we expect that value can only be 0 or 1
                        Utils.expectToBeMultiple(value, [0, 1]);
                        break;
                }
            }).toThrowError(`A default switch case did not observe the correct value, expected a value among 0,1, but got 2 instead.`);
        });
    });
    describe('getNonNullable', () => {
        it('should fail if the value is null or undefined', () => {
            expect(() => Utils.getNonNullable(null)).toThrowError('Expected value not to be null or undefined, but it was.');
            expect(() => Utils.getNonNullable(undefined)).toThrowError('Expected value not to be null or undefined, but it was.');
        });
        it('should return the value if it is not null', () => {
            expect(Utils.getNonNullable(42)).toBe(42);
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
            expect(() => assert(false, 'error')).toThrowError('Encountered error: Assertion failure: error');
        });
    });
});
