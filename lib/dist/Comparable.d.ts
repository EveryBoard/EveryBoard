import { JSONPrimitive } from './JSON';
export interface ComparableObject {
    equals(other: this): boolean;
}
export type ComparableValue = JSONPrimitive | ComparableObject | ComparableJSON;
export type ComparableJSON = {
    [key: string]: ComparableValue;
    [key: number]: ComparableValue;
};
export type Comparable = JSONPrimitive | ComparableObject | ComparableJSON;
export declare function isComparableObject(value: unknown): value is ComparableObject;
export declare function isComparableJSON(value: any): value is ComparableJSON;
export declare function isComparableValue(value: unknown): value is ComparableValue;
export declare function comparableEquals<T>(a: T, b: T): boolean;
