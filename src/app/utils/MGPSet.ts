import { Comparable, comparableEquals, ComparableObject } from './Comparable';
import { MGPOptional } from './MGPOptional';
import { Sets } from './Sets';

export class MGPSet<T extends Comparable> implements ComparableObject {

    protected values: T[];

    constructor(values?: readonly T[], private isMutable: boolean = true) {
        if (values === undefined) {
            this.values = [];
        } else {
            this.values = Sets.toComparableSet(values);
        }
    }
    public makeImmutable(): void {
        this.isMutable = false;
    }
    public equals(other: MGPSet<T>): boolean {
        if (other.size() !== this.size()) {
            return false;
        }
        for (const coord of this) {
            if (other.contains(coord) === false) {
                return false;
            }
        }
        return true;
    }
    public toString(): string {
        let result: string = '';
        for (const element of this) {
            if (element == null) {
                result += 'null, ';
            } else {
                result += element.toString() + ', ';
            }
        }
        return '[' + result.slice(0, -2) + ']';
    }
    public add(element: T): boolean {
        if (this.isMutable === false) {
            throw new Error('Cannot add to immutable MGPSet');
        }
        if (this.contains(element)) {
            return false;
        } else {
            this.values.push(element);
            return true;
        }
    }
    public addAll(otherSet: MGPSet<T>): void {
        if (this.isMutable === false) {
            throw new Error('Cannot addAll to immutable MGPSet');
        }
        for (const element of otherSet) {
            this.add(element);
        }
    }
    public contains(element: T): boolean {
        for (const value of this.values) {
            if (comparableEquals(value, element)) {
                return true;
            }
        }
        return false;
    }
    public map<V extends Comparable>(mapper: (element: T) => V): MGPSet<V> {
        const mappedList: V[] = [];
        for (const element of this.values) {
            mappedList.push(mapper(element));
        }
        return new MGPSet(mappedList, this.isMutable);
    }
    public size(): number {
        return this.values.length;
    }
    public toList(): T[] {
        const result: T[] = [];
        for (const value of this) {
            result.push(value);
        }
        return result;
    }
    public getAnyElement(): MGPOptional<T> {
        if (this.size() > 0) {
            return MGPOptional.of(this.values[0]);
        } else {
            return MGPOptional.empty();
        }
    }
    public isEmpty(): boolean {
        return this.values.length === 0;
    }
    [Symbol.iterator](): IterableIterator<T> {
        return this.values.values();
    }
}
