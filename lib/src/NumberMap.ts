import { Comparable } from './Comparable';
import { MGPMap } from './MGPMap';
import { MGPOptional } from './MGPOptional';
import { Utils } from './Utils';

export class NumberMap<T extends NonNullable<Comparable>> extends MGPMap<T, number> {

    public add(key: T, value: number): MGPOptional<number> {
        const oldValue: MGPOptional<number> = this.get(key);
        Utils.assert(oldValue.isPresent(), `NumberMap.add called on an invalid key: ${key}`);
        return this.put(key, oldValue.get() + value);
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
