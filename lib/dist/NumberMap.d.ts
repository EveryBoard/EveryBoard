import { Comparable } from './Comparable';
import { MGPMap } from './MGPMap';
import { MGPOptional } from './MGPOptional';
export declare class NumberMap<T extends NonNullable<Comparable>> extends MGPMap<T, number> {
    add(key: T, value: number): MGPOptional<number>;
    addOrSet(key: T, value: number): MGPOptional<number>;
}
