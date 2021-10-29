import { JSONPrimitive } from './utils';

export interface ComparableObject {
    equals(o: ComparableObject): boolean;

    toString(): string;
}
export type ComparableValue = JSONPrimitive | ComparableObject | ComparableJSON;

export type ComparableJSON = {
    [key: string]: ComparableValue,
    [key: number]: ComparableValue,
};

export type Comparable = JSONPrimitive | ComparableObject | ComparableJSON;

export function comparableEquals<T extends Comparable>(a: T, b: T): boolean {
    if (a != null && b != null && typeof a === 'object') {
        if (a['equals']) {
            const comparableValue: ComparableObject = a as ComparableObject;
            const otherComparable: ComparableObject = b as ComparableObject;
            return comparableValue.equals(otherComparable);
        } else {
            const aJSON: ComparableJSON = a as ComparableJSON;
            const bJSON: ComparableJSON = b as ComparableJSON;
            for (const key of Object.keys(aJSON)) {
                if (key in bJSON) {
                    if (comparableEquals(aJSON[key], bJSON[key]) === false) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return true;
        }
    } else {
        return a === b;
    }
}
