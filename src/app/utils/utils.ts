import firebase from 'firebase';

// These are the datatypes supported by firestore. Arrays of arrays are not
// supported, but arrays containing objects containing arrays are, which is what
// is encoded in these types.
export type JSONPrimitive = firebase.firestore.FieldValue | string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | Array<JSONValueWithoutArray>;
export type JSONValueWithoutArray = JSONPrimitive | JSONObject
export type JSONObject = { [member: string]: JSONValue };

export class Utils {
    public static handleError(message: string): void {
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
