import { Comparable } from '../collection-lib/Comparable';
import { Sets } from '../collection-lib/sets/Sets';

export class MGPSet<T extends Comparable> implements Comparable {

    constructor(private values?: T[]) {
        if (values == null) {
            this.values = [];
        } else {
            this.values = Sets.toImmutableSet(values);
        }
    }
    public equals(other: MGPSet<T>): boolean {
        if (other.size() !== this.size()) {
            return false;
        }
        for (let i: number = 0; i < this.size(); i++) {
            const thisElement: T = this.values[i];
            const thisCount: number = this.count(thisElement);
            const otherCount: number = other.count(thisElement);
            if (thisCount !== otherCount) {
                return false;
            }
        }
        return true;
    }
    public count(element: T): number {
        let count: number = 0;
        for (let i: number = 0; i < this.size(); i++) {
            if (this.values[i].equals(element)) {
                count++;
            }
        }
        return count;
    }
    public toString(): string {
        throw new Error('Method not implemented.');
    }
    public add(element: T): boolean {
        if (this.contains(element)) {
            return false;
        } else {
            this.values.push(element);
            return false;
        }
    }
    public contains(element: T): boolean {
        for (const value of this.values) {
            if (value.equals(element)) {
                return true;
            }
        }
        return false;
    }
    public size(): number {
        return this.values.length;
    }
    public get(index: number): T {
        return this.values[index];
    }
    public toArray(): T[] {
        const result: T[] = [];
        for (const value of this.values) {
            result.push(value);
        }
        return result;
    }
}
