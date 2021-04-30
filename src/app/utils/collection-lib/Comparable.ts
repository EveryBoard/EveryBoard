import { JSONPrimitive } from '../utils/utils';

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
            throw new Error('comparableEquals not implemented with Object that have no equals method!');
        }
    } else {
        return a === b;
    }
}
