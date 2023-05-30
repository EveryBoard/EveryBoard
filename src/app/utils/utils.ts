import { FieldValue } from '@angular/fire/firestore';
import { ErrorLoggerService } from '../services/ErrorLoggerService';

// These are the datatypes supported by firestore. Arrays of arrays are not
// supported, but arrays containing objects containing arrays are, which is what
// is encoded in these types.

export type JSONPrimitive = string | number | boolean | null | undefined;
export type JSONValue = JSONPrimitive | JSONObject | Array<JSONValueWithoutArray>;
export type JSONValueWithoutArray = JSONPrimitive | JSONObject
export type JSONObject = { [member: string]: JSONValue };

export function isJSONPrimitive(value: unknown): value is JSONPrimitive {
    if (typeof value === 'string') return true;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return true;
    if (value === null) return true;
    return false;
}

export type FirestoreJSONPrimitive = JSONPrimitive | FieldValue;
export type FirestoreJSONValue = FirestoreJSONPrimitive |
                                 FirestoreJSONObject |
                                 Array<FirestoreJSONValueWithoutArray> |
                                 ReadonlyArray<FirestoreJSONValueWithoutArray>;
export type FirestoreJSONValueWithoutArray = FirestoreJSONPrimitive | FirestoreJSONObject
export type FirestoreJSONObject = { [member: string]: FirestoreJSONValue };

export class Utils {

    public static expectToBe<T>(value: T, expected: T, message?: string): void {
        if (value !== expected) {
            if (message !== undefined) {
                throw new Error(message);
            }
            throw new Error(`A default switch case did not observe the correct value, expected ${expected}, but got ${value} instead.`);
        }
    }
    public static expectToBeMultiple<T>(value: T, expectedValues: T[]): void {
        let found: boolean = false;
        for (const expected of expectedValues) {
            if (value === expected) {
                found = true;
                break;
            }
        }
        if (found === false) {
            throw new Error(`A default switch case did not observe the correct value, expected a value among ${expectedValues}, but got ${value} instead.`);
        }
    }
    public static getNonNullable<T>(value : T | null | undefined): T {
        Utils.assert(value != null, `Expected value not to be null or undefined, but it was.`);
        return value as T;
    }
    public static assert(condition: boolean, message: string): void {
        if (condition === false) {
            // We log the error but we also throw an exception
            // This is because if an assertion fails,
            // we don't want to execute the code after the assertion.
            // Otherwise, this could result in potentially very serious issues.
            ErrorLoggerService.logError('Assertion failure', message);
            throw new Error(`Assertion failure: ${message}`);
        }
    }
    public static identity<T>(thing: T): T {
        return thing;
    }
}

export function display(verbose: boolean, message: unknown): void {
    if (verbose) {
        console.log(message);
    }
}
