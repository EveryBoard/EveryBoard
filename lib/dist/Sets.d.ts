import { Comparable, ComparableObject } from './Comparable';
export declare class Sets {
    static toComparableObjectSet<T extends ComparableObject>(list: readonly T[]): T[];
    static toComparableSet<T extends Comparable>(list: readonly T[]): T[];
}
