import { FieldValue } from 'firebase/firestore';
import { MGPOptional } from './MGPOptional';

// These are the datatypes supported by firestore. Arrays of arrays are not
// supported, but arrays containing objects containing arrays are, which is what
// is encoded in these types.

export type JSONPrimitive = string | number | boolean | null;
// Nothing really prevents us from dealing with arrays of arrays, except for TypeScript's type system.
export type JSONValue = JSONPrimitive | JSONObject | Array<JSONValueWithoutArray>;
export type JSONValueWithoutArray = JSONPrimitive | JSONObject;
export type JSONObject = { [member: string]: JSONValue };

export type FullJSONValue = JSONPrimitive | FullJSONObject | Array<FullJSONValue>;
export type FullJSONObject = { [member: string]: FullJSONValue };
export function isJSONPrimitive(value: unknown): value is JSONPrimitive {
    if (typeof value === 'string') return true;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return true;
    if (value === null) return true; // null if of type 'object', so we check for equality instead
    return false;
}

export class JSONParser {

    private static toJSONValue(v: unknown): JSONValue {
        if (isJSONPrimitive(v)) return v;
        if (Array.isArray(v)) {
            const array: Array<JSONValueWithoutArray> = [];
            for (const item of v) {
                array.push(JSONParser.toJSONValueWithoutArray(item));
            }
            return array;
        } else {
            // The only type left is "object", because we know it's coming from JSON.parse
            return JSONParser.toJSONObject(v as object);
        }
    }

    private static toJSONObject(v: object): JSONObject {
        const obj: JSONObject = {};
        for (const [key, value] of Object.entries(v)) {
            obj[key] = JSONParser.toJSONValue(value);
        }
        return obj;
    }

    private static toJSONValueWithoutArray(v: unknown): JSONValueWithoutArray {
        if (isJSONPrimitive(v)) return v;
        if (Array.isArray(v)) {
            throw Error(`this is array contained in another array, which is forbidden: ${v}`);
        } else {
            return JSONParser.toJSONObject(v as object);
        }
    }

    // Try to parse a JSONValue and to return it. Fails with MGPOptional.empty otherwise.
    public static parseJSONSafely(json: string): MGPOptional<JSONValue> {
        try {
            return MGPOptional.of(JSONParser.toJSONValue(JSON.parse(json)));
        } catch {
            return MGPOptional.empty();
        }
    }
}

export type FirestoreJSONPrimitive = JSONPrimitive | FieldValue;
export type FirestoreJSONValue =
    FirestoreJSONPrimitive |
    FirestoreJSONObject |
    Array<FirestoreJSONValueWithoutArray> |
    ReadonlyArray<FirestoreJSONValueWithoutArray>;
export type FirestoreJSONValueWithoutArray = FirestoreJSONPrimitive | FirestoreJSONObject;
export type FirestoreJSONObject = { [member: string]: FirestoreJSONValue };
