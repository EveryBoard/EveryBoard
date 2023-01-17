import { Comparable, comparableEquals, ComparableObject } from './Comparable';
import { MGPOptional } from './MGPOptional';
import { Sets } from './Sets';

export class MGPSet<T extends Comparable> implements ComparableObject {

    protected values: T[];

    constructor(values?: readonly T[]) {
        if (values === undefined) {
            this.values = [];
        } else {
            this.values = Sets.toComparableSet(values);
        }
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
        if (this.contains(element)) {
            return false;
        } else {
            this.values.push(element);
            return true;
        }
    }
    public remove(element: T): void {
        for (let i: number = 0; i < this.values.length; i++) {
            if (comparableEquals(this.values[i], element)) {
                this.values.splice(i, 1);
                return;
            }
        }
    }
    public union(otherSet: MGPSet<T>): void {
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
    public map<T2 extends Comparable>(f: (element: T) => T2): MGPSet<T2> {
        const result: MGPSet<T2> = new MGPSet();
        for (const element of this) {
            result.add(f(element));
        }
        return result;
    }
    public flatMap<T2 extends Comparable>(f: (element: T) => MGPSet<T2>): MGPSet<T2> {
        const result: MGPSet<T2> = new MGPSet();
        for (const element of this) {
            result.union(f(element));
        }
        return result;
    }
    public filter(f: (element: T) => boolean): MGPSet<T> {
        const result: MGPSet<T> = new MGPSet();
        for (const element of this) {
            if (f(element)) {
                result.add(element);
            }
        }
        return result;
    }
    public findCommonElement(other: MGPSet<T>): MGPOptional<T> {
        for (const element of other) {
            if (this.contains(element)) {
                return MGPOptional.of(element);
            }
        }
        return MGPOptional.empty();
    }
    public intersect(other: MGPSet<T>): MGPSet<T> {
        const result: MGPSet<T> = new MGPSet();
        for (const element of other) {
            if (this.contains(element)) {
                result.add(element);
            }
        }
        return result;
    }
    [Symbol.iterator](): IterableIterator<T> {
        return this.values.values();
    }
}
