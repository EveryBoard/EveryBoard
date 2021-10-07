import { isJSONPrimitive, JSONPrimitive, Utils } from './utils';

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
    if (typeof a === 'object') {
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

export function isComparableObject(value: unknown): value is ComparableObject {
    return typeof value === 'object' && value['equals'] != null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function isComparableJSON(value: any): value is ComparableJSON {
    if (typeof value === 'object') {
        for (const key in value) {
            // TODO FOR REVIEW: can key be any other type than string or number? If so, this needs to be checked
            if (isComparableValue(value[key]) === false) return false;
        }
        return true;
    } else {
        return false;
    }
}

export function isComparableValue(value: unknown): value is ComparableValue {
    return isComparableObject(value) || isJSONPrimitive(value) || isComparableJSON(value);
}

export function comparableEqualsIfComparable<T>(a: T, b: T): boolean {
    if (isComparableValue(a) && isComparableValue(b)) {
        return comparableEquals(a, b);
    } else {
        Utils.handleError('Comparing non comparable objects');
        return false;
    }
}
