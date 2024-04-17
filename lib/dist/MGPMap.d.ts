import { MGPOptional } from './MGPOptional';
import { Comparable } from './Comparable';
import { MGPSet } from './MGPSet';
export declare class MGPMap<K extends NonNullable<Comparable>, V extends NonNullable<unknown>> {
    private map;
    private isImmutable;
    static from<K extends string | number, V extends NonNullable<unknown>>(record: Record<K, V>): MGPMap<K, V>;
    constructor(map?: {
        key: K;
        value: V;
    }[], isImmutable?: boolean);
    makeImmutable(): void;
    get(key: K): MGPOptional<V>;
    getAnyPair(): MGPOptional<{
        key: K;
        value: V;
    }>;
    forEach(callback: (item: {
        key: K;
        value: V;
    }) => void): void;
    putAll(m: MGPMap<K, V>): void;
    assertImmutability(methodCalled: string): void;
    put(key: K, value: V): MGPOptional<V>;
    containsKey(key: K): boolean;
    size(): number;
    listKeys(): K[];
    listValues(): V[];
    getKeySet(): MGPSet<K>;
    filter(predicate: (key: K, value: V) => boolean): MGPMap<K, V>;
    replace(key: K, newValue: V): V;
    set(key: K, firstValue: V): void;
    delete(key: K): V;
    getCopy(): this;
    equals(other: MGPMap<K, V>): boolean;
}
export declare class ReversibleMap<K extends NonNullable<Comparable>, V extends NonNullable<Comparable>> extends MGPMap<K, V> {
    reverse(): ReversibleMap<V, MGPSet<K>>;
}
