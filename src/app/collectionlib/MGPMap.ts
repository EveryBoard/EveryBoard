export interface Comparable {

    equals(o: any): boolean;

    toString(): String;
}

export class MGPMap<K extends Comparable, V> {

    private map: {key: K, value: V}[] = [];

    public get(index: number) {
        return this.map[index];
    }
    public putAll(m: MGPMap<K, V>) {
        for (let entry of m.map) {
            this.put(entry.key, entry.value);
        }
    }
    public put(key: K, value: V) {
        if (key == null) throw new Error("Key cannot be null");
        if (value == null) throw new Error("Value cannot be null");
        if (this.containsKey(key)) {
            throw new Error("Key " + key.toString() + " aldready exist in Map");
        } else {
            this.map.push({key, value});
        }
    }
    public containsKey(key: K): boolean {
        return this.map.some(entry => entry.key.equals(key));
    }
    public size(): number {
        return this.map.length;
    }
    public listKeys(): K[] {
        return this.map.map((entry: {key: K, value: V}) => {
            return entry.key
        });
    }
}