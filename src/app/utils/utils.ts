import firebase from 'firebase';

// These are the datatypes supported by firestore. Arrays of arrays are not
// supported, but arrays containing objects containing arrays are, which is what
// is encoded in these types.

export type JSONPrimitive = string | number | boolean | null;
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
export type FirebaseJSONValue = FirebaseJSONPrimitive | FirebaseJSONObject | Array<FirebaseJSONValueWithoutArray>;
export type FirebaseJSONValueWithoutArray = FirebaseJSONPrimitive | FirebaseJSONObject
export type FirebaseJSONObject = { [member: string]: FirebaseJSONValue };

export class Utils {
    // Returns any because in the future it may return a MGPValidation/MGPFallible in production
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static handleError(message: string): any {
        throw new Error('Encountered error: ' + message);
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
