import { Comparable, comparableEquals } from './Comparable';
import { AbstractSet } from './AbstractSet';
import { MutableSet } from './MutableSet';
import { ArrayUtils } from './ArrayUtils';

export class ImmutableSet<T extends Comparable> extends AbstractSet<T> {

    public toMutableSet(): MutableSet<T> {
        return new MutableSet(this.toList());
    }

    public union(otherSet: AbstractSet<T>): this {
        const result: MutableSet<T> = this.toMutableSet();
        result.addAll(otherSet);
        return this.provideInstance(result.toList());
    }

    public unionList(list: T[]): this {
        return this.provideInstance<T>(list.concat(this.values));
    }

    public unionElement(element: T): this {
        return this.provideInstance<T>(this.values.concat([element]));
    }

    public filter(f: (element: T) => boolean): this {
        return this.provideInstance<T>(this.toList().filter(f));
    }

    public filterElement(element: T): this {
        return this.filter((e: T) => comparableEquals(e, element));
    }

    public map<V extends Comparable>(mapper: (element: T) => V): ImmutableSet<V> {
        const result: V[] = ArrayUtils.map(this.values, mapper);
        return new ImmutableSet<V>(result);
    }

    public flatMap<U extends Comparable>(f: (element: T) => ImmutableSet<U>): ImmutableSet<U> {
        const result: MutableSet<U> = new MutableSet();
        for (const element of this) {
            result.addAll(f(element));
        }
        return result.toImmutableSet();
    }

    public intersection(other: AbstractSet<T>): this {
        const result: MutableSet<T> = new MutableSet();
        for (const element of other) {
            if (this.contains(element)) {
                result.add(element);
            }
        }
        return this.provideInstance(result.toList());
    }

}
