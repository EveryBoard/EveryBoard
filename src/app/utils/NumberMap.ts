import { Comparable } from './Comparable';
import { MGPMap } from './MGPMap';
import { MGPOptional } from './MGPOptional';

export class NumberMap<T extends NonNullable<Comparable>> extends MGPMap<T, number> {

    public add(key: T, value: number): MGPOptional<number> {
        const oldValue: number = this.get(key).get();
        return this.put(key, oldValue + value);
    }

    public addOrSet(key: T, value: number): MGPOptional<number> {
        if (this.containsKey(key)) {
            return this.add(key, value);
        } else {
            this.set(key, value);
            return MGPOptional.of(value);
        }
    }

}
