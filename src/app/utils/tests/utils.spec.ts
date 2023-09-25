/* eslint-disable max-lines-per-function */
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { Debug, isJSONPrimitive, Utils } from '../utils';

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
    describe('assert', () => {
        it('should log error and throw when condition is false', () => {
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            expect(() => Utils.assert(false, 'error')).toThrowError('Assertion failure: error');
            expect(ErrorLoggerService.logError).toHaveBeenCalledWith('Assertion failure', 'error');
        });
    });
});

@Debug.log
class MyClass {
    public someMethod(arg: number): string {
        return 'boo';
    }
    public someCycliclyUnprintableObjectIsReturned(): object {
        const a: object = {
            value: 5,
        };
        const b: object = {
            reference: a,
        };
        // eslint-disable-next-line dot-notation
        a['ref'] = b; // Will cause an infinite loop when JSON.stringify
        return a;
    }
}

describe('Debug', () => {
    describe('display', () => {
        it('should log when verbose is enabled on the current method', () => {
            // Given a verbose-enabled method
            spyOn(console, 'log').and.returnValue();
            Debug.enableLog([true, true], 'Class', 'method');
            // When calling Debug.display
            Debug.display('Class', 'method', 'message');
            // Then it should have logged the message
            expect(console.log).toHaveBeenCalledOnceWith('Class.method: message');
        });
        it('should log when verbose is enabled on the current class', () => {
            // Given a verbose-enabled class
            spyOn(console, 'log').and.returnValue();
            Debug.enableLog([true, true], 'Class');
            // When calling Debug.display
            Debug.display('Class', 'method', 'message');
            // Then it should have logged the message
            expect(console.log).toHaveBeenCalledOnceWith('Class.method: message');
        });
        it('should not log when verbose is disabled', () => {
            // Given a verbose-disabled method and class
            spyOn(console, 'log').and.returnValue();
            Debug.enableLog([false, false], 'Class', 'method');
            // When calling Debug.display
            Debug.display('Class', 'method', 'message');
            // Then it should have logged the message
            expect(console.log).not.toHaveBeenCalled();
        });
        it('should not log when verbose is unset', () => {
            // Given a verbose-unset method and class
            spyOn(console, 'log').and.returnValue();
            // When calling Debug.display
            Debug.display('Class', 'method', 'message');
            // Then it should have logged the message
            expect(console.log).not.toHaveBeenCalled();
        });
        it('should still work with multiple calls to enableLog', () => {
            // Given a verbose-enabled method
            spyOn(console, 'log').and.returnValue();
            Debug.enableLog([true, true], 'Class', 'otherMethod');
            Debug.enableLog([true, true], 'Class', 'method');
            // When calling Debug.display
            Debug.display('Class', 'method', 'message');
            // Then it should have logged the message
            expect(console.log).toHaveBeenCalledOnceWith('Class.method: message');
        });
    });
    describe('log annotation', () => {
        it('should not bug when cyclicity stringification bug occur', () => {
            // Given a verbose-enabled method
            spyOn(console, 'log').and.returnValue();
            Debug.enableLog([false, true], 'MyClass', 'someCycliclyUnprintableObjectIsReturned');
            // When calling the method
            const instance: MyClass = new MyClass();
            instance.someCycliclyUnprintableObjectIsReturned();

            // Then it should not have throwed when trying to log recursive object
            expect(console.log).toHaveBeenCalledWith('< MyClass.someCycliclyUnprintableObjectIsReturned -> recursive and not stringifiable!');
        });
        it('should log entry and exit when verbose is enabled', () => {
            // Given a verbose-enabled method
            spyOn(console, 'log').and.returnValue();
            Debug.enableLog([true, true], 'MyClass', 'someMethod');
            // When calling the method
            const instance: MyClass = new MyClass();
            instance.someMethod(42);

            // Then it should have logged on entry and exit
            expect(console.log).toHaveBeenCalledWith('> MyClass.someMethod(42)');
            expect(console.log).toHaveBeenCalledWith('< MyClass.someMethod -> "boo"');
        });
        it('should log entry only when verbose is enabled for entry only', () => {
            // Given a verbose-enabled method
            spyOn(console, 'log').and.returnValue();
            Debug.enableLog([true, false], 'MyClass', 'someMethod');
            // When calling the method
            const instance: MyClass = new MyClass();
            instance.someMethod(42);

            // Then it should have logged on entry only
            expect(console.log).toHaveBeenCalledWith('> MyClass.someMethod(42)');
            expect(console.log).not.toHaveBeenCalledWith('< MyClass.someMethod -> "boo"');
        });
        it('should log exit only when verbose is enabled for exit only', () => {
            // Given a verbose-enabled method
            spyOn(console, 'log').and.returnValue();
            Debug.enableLog([false, true], 'MyClass', 'someMethod');
            // When calling the method
            const instance: MyClass = new MyClass();
            instance.someMethod(42);

            // Then it should have logged on exit only
            expect(console.log).not.toHaveBeenCalledWith('> MyClass.someMethod(42)');
            expect(console.log).toHaveBeenCalledWith('< MyClass.someMethod -> "boo"');
        });
        it('should not log when verbose is disabled', () => {
            // Given a verbose-disabled method
            spyOn(console, 'log').and.returnValue();
            Debug.enableLog([false, false], 'MyClass', 'someMethod');
            // When calling the method
            const instance: MyClass = new MyClass();
            instance.someMethod(42);

            // Then it should not have logged
            expect(console.log).not.toHaveBeenCalled();
        });
    });
    it('should remember settings across sessions through localStorage', () => {
        // Given a page
        spyOn(console, 'log').and.returnValue();
        // When enabling logging
        Debug.enableLog([true, true], 'Class', 'method');
        // Then it should be stored in localStorage for future sessions
        const verbosity: object = JSON.parse(Utils.getNonNullable(localStorage.getItem('verbosity')));
        expect(verbosity['Class.method']).toEqual([true, true]);
    });
    afterEach(() => {
        // We need to forget our debug settings after each test
        localStorage.clear();
    });
});
