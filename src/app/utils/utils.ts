import firebase from 'firebase';

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

export type FirebaseJSONPrimitive = JSONPrimitive | firebase.firestore.FieldValue;
export type FirebaseJSONValue =
    FirebaseJSONPrimitive |
    FirebaseJSONObject |
    Array<FirebaseJSONValueWithoutArray> |
    ReadonlyArray<FirebaseJSONValueWithoutArray>;
export type FirebaseJSONValueWithoutArray = FirebaseJSONPrimitive | FirebaseJSONObject
export type FirebaseJSONObject = { [member: string]: FirebaseJSONValue };

export class Utils {
    // Returns any because in the future it may return a MGPValidation/MGPFallible in production
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static handleError(message: string): any {
        throw new Error('Encountered error: ' + message);
    }
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
        if (value == null) {
            throw new Error(`Expected value not to be null or undefined, but it was.`);
        } else {
            return value;
        }
    }
}

export function display(verbose: boolean, message: unknown): void {
    if (verbose) {
        console.log(message);
    }
}

export function assert(condition: boolean, message: string): void {
    if (condition === false) {
        throw new Error('Assertion failure: ' + message);
    }
}
