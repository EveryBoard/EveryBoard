import { MGPOptional } from "../mgpoptional/MGPOptional";
import { Comparable } from "../Comparable";

export class MGPMap<K extends Comparable, V> {

    private map: {key: K, value: V}[] = [];

    public get(key: K): MGPOptional<V> {
        if (key == null) throw new Error("Searched key will always be absent");
        for (let keymap of this.map) {
            if (keymap.key.equals(key))
                return MGPOptional.of(keymap.value);
        }
        return MGPOptional.empty();
    }
    public getByIndex(index: number) {
        return this.map[index];
    }
    public putAll(m: MGPMap<K, V>) {
        for (let entry of m.map) {
            this.put(entry.key, entry.value);
        }
    }
    public put(key: K, value: V): MGPOptional<V> {
        if (key == null) throw new Error("Key cannot be null");
        if (value == null) throw new Error("Value cannot be null");
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
        return this.map.some(entry => entry.key.equals(key));
    }
    public size(): number {
        return this.map.length;
    }
    public listKeys(): K[] {
        return this.map.map((entry: {key: K, value: V}) => entry.key);
    }
    public replace(key: K, newValue: V): V {
        if (key == null) throw new Error("Key null has no mapped value");
        if (newValue == null) throw new Error("Cannot replace value by null, use delete instead");
        for (let i: number = 0; i < this.map.length; i++) {
            const entry: {key: K, value: V} = this.map[i];
            if (entry.key.equals(key)) {
                const oldValue: V = this.map[i].value;
                this.map[i].value = newValue;
                return oldValue;
            }
        }
        throw new Error("No Value to replace for key "+ key.toString());
    }
    public set(key: K, firstValue: V) {
        if (key == null) throw new Error("Key cannot be null");
        if (firstValue == null) throw new Error("Value cannot be null");
        if (this.containsKey(key)) {
            throw new Error("Key " + key.toString() + " aldready exist in Map");
        } else {
            this.map.push({key, value: firstValue});
        }
    }
    public delete(key: K): V {
        if (key == null) throw new Error("Key null has no mapped value");
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
        throw new Error("No Value to delete for key "+ key.toString());
    }
}