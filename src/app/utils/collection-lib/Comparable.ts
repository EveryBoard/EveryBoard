export interface Comparable {
    equals(o: Comparable): boolean;

    toString(): string;
}

export function ComparableEquals(a: Comparable, b: Comparable): boolean {
    return a.equals(b);
}

export function StrictEquals<T>(a: T, b: T): boolean {
    return a === b;
}
