import { MGPOptional } from './MGPOptional';
import { Comparable, comparableEquals } from './Comparable';
import { MGPSet } from './MGPSet';
import { assert } from './utils';

export class MGPMap<K extends Comparable, V extends Comparable> {

    private map: {key: K, value: NonNullable<V>}[] = [];

    private isImmutable: boolean = false;

    public makeImmutable(): void {
        this.isImmutable = true;
    }
    public get(key: K): MGPOptional<V> {
        if (key == null) throw new Error('Key cannot be null!');
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
            this.put(entry.key as NonNullable<K>, entry.value);
        }
    }
    public checkImmutability(methodCalled: string): void {
        if (this.isImmutable) {
            throw new Error('Cannot call ' + methodCalled + ' on immutable map!');
        }
    }
    public put(key: NonNullable<K>, value: NonNullable<V>): MGPOptional<V> {
        this.checkImmutability('put');
        if (key == null) throw new Error('Key cannot be null!');
        if (value == null) throw new Error('Value cannot be put to null (for key ' + key +' )!');
        for (let i: number = 0; i < this.map.length; i++) {
            const entry: {key: K, value: V} = this.map[i];
            if (comparableEquals(entry.key, key)) {
                const oldValue: NonNullable<V> = this.map[i].value;
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
    public replace(key: K, newValue: NonNullable<V>): V {
        this.checkImmutability('replace');
        if (key == null) throw new Error('Key cannot be null!');
        if (newValue == null) throw new Error('Value cannot be replaced by null (for key ' + key + '), use delete instead!');
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
    public set(key: K, firstValue: NonNullable<V>): void {
        this.checkImmutability('set');
        if (key == null) throw new Error('Key cannot be null!');
        if (firstValue == null) throw new Error('Value cannot be set to null (for key ' + key +' )!');
        if (this.containsKey(key)) {
            throw new Error('Key ' + key.toString() + ' already exist in Map!');
        } else {
            this.map.push({ key, value: firstValue });
        }
    }
    public delete(key: K): V {
        this.checkImmutability('delete');
        if (key == null) throw new Error('Key cannot be null!');
        for (let i: number = 0; i < this.map.length; i++) {
            const entry: {key: K, value: V} = this.map[i];
            if (comparableEquals(entry.key, key)) {
                const oldValue: V = this.map[i].value;
                const beforeDeleted: {key: K, value: NonNullable<V>}[] = this.map.slice(0, i);
                const afterDeleted: {key: K, value: NonNullable<V>}[] = this.map.slice(i + 1);
                this.map = beforeDeleted.concat(afterDeleted);
                return oldValue;
            }
        }
        throw new Error('No Value to delete for key "'+ key.toString() +'"!');
    }
    public getCopy(): MGPMap<K, V> {
        const newMap: MGPMap<K, V> = new MGPMap<K, V>();
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
    public groupByValue(): MGPMap<V, MGPSet<K>> {
        const reversedMap: MGPMap<V, MGPSet<K>> = new MGPMap<V, MGPSet<K>>();
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
