import firebase from 'firebase';

// These are the datatypes supported by firestore. Arrays of arrays are not
// supported, but arrays containing objects containing arrays are, which is what
// is encoded in these types.

export type JSONPrimitive = string | number | boolean | null | undefined;
export type JSONValue = JSONPrimitive | JSONObject | Array<JSONValueWithoutArray>;
export type JSONValueWithoutArray = JSONPrimitive | JSONObject
export type JSONObject = { [member: string]: JSONValue };

export type FirebaseJSONPrimitive = JSONPrimitive | firebase.firestore.FieldValue | undefined;
export type FirebaseJSONValue = FirebaseJSONPrimitive | FirebaseJSONObject | Array<FirebaseJSONValueWithoutArray>;
export type FirebaseJSONValueWithoutArray = FirebaseJSONPrimitive | FirebaseJSONObject
export type FirebaseJSONObject = { [member: string]: FirebaseJSONValue };

export class Utils {
    public static handleError(message: string): void {
        throw new Error('Encountered error: ' + message);
    }
    public static defaultCase<T>(value: T, expected: T): void {
        if (value !== expected) {
            throw new Error(`A default switch case did not observe the correct value, expected ${expected}, but got ${value} instead.`);
        }
    }
    public static defaultCaseMultiple<T>(value: T, expectedValues: T[]): void {
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
    public static getNonNullOrFail<T>(value : T | null): T {
        if (value === null) {
            throw new Error('Expected value not to be null, but it was');
        } else {
            return value;
        }
    }
    public static getDefinedOrFail<T>(value : T | undefined): T {
        if (value === undefined) {
            throw new Error('Expected value not to be undefined, but it was');
        } else {
            return value;
        }
    }
    public static getNonNullDefinedOrFail<T>(value : T | undefined | null): T {
        return Utils.getNonNullOrFail(Utils.getDefinedOrFail(value));
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
