import { Comparable, comparableEquals } from './Comparable';
import { AbstractSet } from './AbstractSet';
import { ArrayUtils } from './ArrayUtils';

export class ImmutableSet<T extends Comparable> extends AbstractSet<T> {

    public union(otherSet: AbstractSet<T>): this {
        const values: T[] = this.toList().concat(otherSet.toList());
        return this.provideInstance(values);
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
        return this.filter((e: T) => comparableEquals(e, element) === false);
    }

    public map<V extends Comparable>(mapper: (element: T) => V): ImmutableSet<V> {
        const result: V[] = ArrayUtils.map(this.values, mapper);
        return new ImmutableSet<V>(result);
    }

    public flatMap<U extends Comparable>(f: (element: T) => ImmutableSet<U>): ImmutableSet<U> {
        let result: ImmutableSet<U> = new ImmutableSet();
        for (const element of this) {
            result = result.union(f(element));
        }
        return result;
    }

    public intersection(other: AbstractSet<T>): this {
        let result: this = this.provideInstance();
        for (const element of other) {
            if (this.contains(element)) {
                result = result.unionElement(element);
            }
        }
        return result;
    }

}
