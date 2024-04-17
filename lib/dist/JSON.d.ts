import { FieldValue } from 'firebase/firestore';
export type JSONPrimitive = string | number | boolean | null | undefined;
export type JSONValue = JSONPrimitive | JSONObject | Array<JSONValueWithoutArray>;
export type JSONValueWithoutArray = JSONPrimitive | JSONObject;
export type JSONObject = {
    [member: string]: JSONValue;
};
export declare function isJSONPrimitive(value: unknown): value is JSONPrimitive;
export type FirestoreJSONPrimitive = JSONPrimitive | FieldValue;
export type FirestoreJSONValue = FirestoreJSONPrimitive | FirestoreJSONObject | Array<FirestoreJSONValueWithoutArray> | ReadonlyArray<FirestoreJSONValueWithoutArray>;
export type FirestoreJSONValueWithoutArray = FirestoreJSONPrimitive | FirestoreJSONObject;
export type FirestoreJSONObject = {
    [member: string]: FirestoreJSONValue;
};
