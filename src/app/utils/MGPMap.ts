import { MGPOptional } from './MGPOptional';
import { Comparable, comparableEquals } from './Comparable';
import { MGPSet } from './MGPSet';
import { assert } from './utils';

export class MGPMap<K extends NonNullable<Comparable>, V extends NonNullable<unknown>> {
    private map: {key: K, value: V}[] = [];

    private isImmutable: boolean = false;

    public makeImmutable(): void {
        this.isImmutable = true;
    }
    public get(key: K): MGPOptional<V> {
        for (const keymap of this.map) {
            if (comparableEquals(keymap.key, key)) {
                return MGPOptional.of(keymap.value);
            }
        }
        return MGPOptional.empty();
    }
    public getByIndex(index: number): {key: K, value: V} {
        return this.map[index];
    }
    public putAll(m: MGPMap<K, V>): void {
        this.checkImmutability('putAll');
        for (const entry of m.map) {
            this.put(entry.key, entry.value);
        }
    }
    public checkImmutability(methodCalled: string): void {
        if (this.isImmutable) {
            throw new Error('Cannot call ' + methodCalled + ' on immutable map!');
        }
    }
    public put(key: K, value: V): MGPOptional<V> {
        this.checkImmutability('put');
        for (let i: number = 0; i < this.map.length; i++) {
            const entry: {key: K, value: V} = this.map[i];
            if (comparableEquals(entry.key, key)) {
                const oldValue: V = this.map[i].value;
                this.map[i].value = value;
                return MGPOptional.of(oldValue);
            }
        }
        this.map.push({ key, value });
        return MGPOptional.empty();
    }
    public containsKey(key: K): boolean {
        return this.map.some((entry: {key: K, value: V}) => comparableEquals(entry.key, key));
    }
    public size(): number {
        return this.map.length;
    }
    public listKeys(): K[] {
        return this.map.map((entry: {key: K, value: V}) => entry.key);
    }
    public getKeySet(): MGPSet<K> {
        return new MGPSet<K>(this.listKeys());
    }
    public filter(predicate: (key: K, value: V) => boolean): MGPMap<K, V> {
        const filtered: MGPMap<K, V> = new MGPMap();
        for (const keyValue of this.map) {
            if (predicate(keyValue.key, keyValue.value)) {
                filtered.set(keyValue.key, keyValue.value);
            }
        }
        return filtered;
    }
    public replace(key: K, newValue: V): V {
        this.checkImmutability('replace');
        for (let i: number = 0; i < this.map.length; i++) {
            const entry: {key: K, value: V} = this.map[i];
            if (comparableEquals(entry.key, key)) {
                const oldValue: V = this.map[i].value;
                this.map[i].value = newValue;
                return oldValue;
            }
        }
        throw new Error('No Value to replace for key '+ key.toString() + '!');
    }
    public set(key: K, firstValue: V): void {
        this.checkImmutability('set');
        if (this.containsKey(key)) {
            throw new Error('Key ' + key.toString() + ' already exist in Map!');
        } else {
            this.map.push({ key, value: firstValue });
        }
    }
    public delete(key: K): V {
        this.checkImmutability('delete');
        for (let i: number = 0; i < this.map.length; i++) {
            const entry: {key: K, value: V} = this.map[i];
            if (comparableEquals(entry.key, key)) {
                const oldValue: V = this.map[i].value;
                const beforeDeleted: {key: K, value: V}[] = this.map.slice(0, i);
                const afterDeleted: {key: K, value: V}[] = this.map.slice(i + 1);
                this.map = beforeDeleted.concat(afterDeleted);
                return oldValue;
            }
        }
        throw new Error('No Value to delete for key "'+ key.toString() +'"!');
    }
    public getCopy(): this {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newMap: this = new (<any> this.constructor)();
        for (const key of this.listKeys()) {
            newMap.set(key, this.get(key).get());
        }
        return newMap;
    }
    public equals(other: MGPMap<K, V>): boolean {
        const thisKeySet: MGPSet<K> = this.getKeySet();
        const otherKeySet: MGPSet<K> = other.getKeySet();
        if (thisKeySet.equals(otherKeySet) === false) {
            return false;
        }
        for (let i: number = 0; i < thisKeySet.size(); i++) {
            const key: K = thisKeySet.get(i);
            const thisValue: V = this.get(key).get();
            const otherValue: MGPOptional<V> = other.get(key);
            assert(otherValue.isPresent(), 'value is absent in a map even though its key is present!');
            if (comparableEquals(thisValue, otherValue.get()) === false) {
                return false;
            }
        }
        return true;
    }
}

export class ReversibleMap<K extends NonNullable<Comparable>, V extends NonNullable<Comparable>> extends MGPMap<K, V> {
    public reverse(): ReversibleMap<V, MGPSet<K>> {
        const reversedMap: ReversibleMap<V, MGPSet<K>> = new ReversibleMap<V, MGPSet<K>>();
        for (const key of this.listKeys()) {
            const value: V = this.get(key).get();
            if (reversedMap.containsKey(value)) {
                reversedMap.get(value).get().add(key);
            } else {
                const newSet: MGPSet<K> = new MGPSet<K>();
                newSet.add(key);
                reversedMap.set(value, newSet);
            }
        }
        return reversedMap;
    }
}
