export interface Comparable {

    equals(o: any): boolean;

    toString(): String;
}

export class MGPMap<K extends Comparable, V> {

    private map: {key: K, value: V}[] = [];

    get(index: number) {
        return this.map[index];
    }

    put(key: K, value: V) {
        if (key == null) throw new Error("Key cannot be null");
        if (value == null) throw new Error("Value cannot be null");
        if (this.containsKey(key)) {
            throw new Error("Key " + key.toString() + " aldready exist in Map");
        } else {
            this.map.push({key, value});
        }
    }

    containsKey(key: K): boolean {
        return this.map.some(entry => entry.key.equals(key));
    }

    size(): number {
        return this.map.length;
    }
}