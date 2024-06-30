import { JSONValue } from './JSON';
import { MGPValidation } from './MGPValidation';

export class Utils {

    /**
     * The error logger is called in order to log errors when they arise.
     * It should be set by the codebase relying on this, for example by doing:
     * Utils.logError = myErrorLogger;
     */
    public static logError: (kind: string, message: string, data?: JSONValue) => MGPValidation =
        (_kind: string, message: string, _data?: JSONValue) => {
            return MGPValidation.failure(message);
        };

    public static expectToBe<T>(value: T, expected: T, message?: string): void {
        if (value !== expected) {
            if (message !== undefined) {
                throw new Error(message);
            }
            throw new Error(`A default switch case did not observe the correct value, expected ${expected}, but got ${value} instead.`);
        }
    }

    public static expectToBeMultiple<T>(value: T, expectedValues: T[]): void {
        for (const expected of expectedValues) {
            if (value === expected) {
                return;
            }
        }
        // No value found!
        throw new Error(`A default switch case did not observe the correct value, expected a value among ${expectedValues}, but got ${value} instead.`);
    }

    public static getNonNullable<T>(value : T | null | undefined): T {
        if (value == null) {
            throw new Error(`Expected value not to be null or undefined, but it was.`);
        } else {
            return value;
        }
    }

    public static assert(condition: boolean, message: string, data?: JSONValue): void {
        if (condition === false) {
            // We log the error but we also throw an exception
            // This is because if an assertion fails,
            // we don't want to execute the code after the assertion.
            // Otherwise, this could result in potentially very serious issues.
            Utils.logError('Assertion failure', message, data);
            if (data === undefined) {
                throw new Error(`Assertion failure: ${message}`);
            } else {
                throw new Error(`Assertion failure: ${message} (${ JSON.stringify(data) })`);
            }
        }
    }

    public static identity<T>(thing: T): T {
        return thing;
    }
}
