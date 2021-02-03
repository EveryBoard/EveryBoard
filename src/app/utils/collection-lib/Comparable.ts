export interface Comparable {
    equals(o: Comparable): boolean;

    toString(): string;
}

export const ComparableEquals = (a: Comparable, b: Comparable) => {
    return a.equals(b);
};
