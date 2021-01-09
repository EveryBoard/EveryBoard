export interface Comparable {
    equals(o: any): boolean;

    toString(): String;
}

export const ComparableEquals = (a: Comparable, b: Comparable) => {
    return a.equals(b);
}
