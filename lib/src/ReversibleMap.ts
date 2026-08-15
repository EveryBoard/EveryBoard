import { Comparable } from './Comparable';
import { MGPMap } from './MGPMap';
import { Set } from './Set';

export class ReversibleMap<K extends NonNullable<Comparable>, V extends NonNullable<Comparable>> extends MGPMap<K, V> {

    public reverse(): ReversibleMap<V, Set<K>> {
        const reversedMap: ReversibleMap<V, Set<K>> = new ReversibleMap<V, Set<K>>();
        for (const key of this.getKeyList()) {
            const value: V = this.get(key).get();
            if (reversedMap.containsKey(value)) {
                const newSet: Set<K> = reversedMap.get(value).get().addElement(key);
                reversedMap.put(value, newSet);
            } else {
                const newSet: Set<K> = new Set<K>([key]);
                reversedMap.set(value, newSet);
            }
        }
        return reversedMap;
    }
}
