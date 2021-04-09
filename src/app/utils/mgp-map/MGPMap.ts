import { MGPOptional } from '../mgp-optional/MGPOptional';
import { Comparable, ComparableEquals, StrictEquals } from '../collection-lib/Comparable';
import { MGPSet } from '../mgp-set/MGPSet';

export class MGPMap<K extends Comparable, V> {
    private map: {key: K, value: V}[] = [];

    private isImmutable: boolean = false;

    public makeImmutable(): void {
        this.isImmutable = true;
    }
    public get(key: K): MGPOptional<V> {
        if (key == null) throw new Error('Key cannot be null!');
        for (const keymap of this.map) {
            if (keymap.key.equals(key)) {
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
        if (key == null) throw new Error('Key cannot be null!');
        if (value == null) throw new Error('Value cannot be null!');
        for (let i: number = 0; i < this.map.length; i++) {
            const entry: {key: K, value: V} = this.map[i];
            if (entry.key.equals(key)) {
                const oldValue: V = this.map[i].value;
                this.map[i].value = value;
                return MGPOptional.of(oldValue);
            }
        }
        this.map.push({ key, value });
        return MGPOptional.empty();
    }
    public containsKey(key: K): boolean {
        return this.map.some((entry: {key: K, value: V}) => entry.key.equals(key));
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
    public replace(key: K, newValue: V): V {
        this.checkImmutability('replace');
        if (key == null) throw new Error('Key cannot be null!');
        if (newValue == null) throw new Error('Value cannot be null, use delete instead!');
        for (let i: number = 0; i < this.map.length; i++) {
            const entry: {key: K, value: V} = this.map[i];
            if (entry.key.equals(key)) {
                const oldValue: V = this.map[i].value;
                this.map[i].value = newValue;
                return oldValue;
            }
        }
        throw new Error('No Value to replace for key '+ key.toString() + '!');
    }
    public set(key: K, firstValue: V): void {
        this.checkImmutability('set');
        if (key == null) throw new Error('Key cannot be null!');
        if (firstValue == null) throw new Error('Value cannot be null!');
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
            if (entry.key.equals(key)) {
                const oldValue: V = this.map[i].value;
                const beforeDeleted: {key: K, value: V}[] = this.map.slice(0, i);
                const afterDeleted: {key: K, value: V}[] = this.map.slice(i + 1);
                this.map = beforeDeleted.concat(afterDeleted);
                return oldValue;
            }
        }
        throw new Error('No Value to delete for key "'+ key.toString() +'" !');
    }
    public getCopy(): MGPMap<K, V> {
        const newMap: MGPMap<K, V> = new MGPMap<K, V>();
        for (const key of this.listKeys()) {
            newMap.set(key, this.get(key).get());
        }
        return newMap;
    }
    public equals(other: MGPMap<K, V>): boolean {
        const keySet: MGPSet<K> = this.getKeySet();
        const otherKeySet: MGPSet<K> = other.getKeySet();
        if (keySet.equals(otherKeySet) === false) {
            return false;
        }
        for (let i: number = 0; i < keySet.size(); i++) {
            const key: K = keySet.get(i);
            const left: V = this.get(key).get();
            const right: MGPOptional<V> = other.get(key);
            if (right.isAbsent()) {
                return false;
            }
            if (StrictEquals(left, right.get()) === false) {
                return false;
            }
        }
        return true;
    }
}
export class MGPBiMap<K extends Comparable, V extends Comparable> extends MGPMap<K, V> {

    public groupByValue(): MGPBiMap<V, MGPSet<K>> {
        const reversedMap: MGPBiMap<V, MGPSet<K>> = new MGPBiMap<V, MGPSet<K>>();
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
    public getCopy(): MGPBiMap<K, V> {
        const newMap: MGPBiMap<K, V> = new MGPBiMap<K, V>();
        for (const key of this.listKeys()) {
            newMap.set(key, this.get(key).get());
        }
        return newMap;
    }
    public equals(other: MGPBiMap<K, V>): boolean {
        const keySet: MGPSet<K> = this.getKeySet();
        const otherKeySet: MGPSet<K> = other.getKeySet();
        if (keySet.equals(otherKeySet) === false) {
            return false;
        }
        for (let i: number = 0; i < keySet.size(); i++) {
            const key: K = keySet.get(i);
            const left: V = this.get(key).get();
            const right: MGPOptional<V> = other.get(key);
            if (right.isAbsent()) {
                return false;
            }
            if (ComparableEquals(left, right.get()) === false) {
                return false;
            }
        }
        return true;
    }
}
