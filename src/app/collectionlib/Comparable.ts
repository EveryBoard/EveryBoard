export interface Comparable {
    equals(o: any): boolean;

    toString(): String;
}

export const Comparable_Equals = (a: Comparable, b: Comparable) => {
    return a.equals(b);
}