import { Coord } from '../jscaip/Coord';
import { Comparable } from './Comparable';
import { MGPSet } from './MGPSet';

export abstract class OptimizedSet<T extends Comparable> extends MGPSet<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly mapping: any;

    protected abstract toFields(value: T): [[number], number];

    public constructor(values?: readonly T[]) {
        super();
        this.mapping = [];
        this.values = [];
        if (values !== undefined) {
            for (const value of values) {
                this.add(value);
            }
        }
    }
    public add(element: T): boolean {
        const fields: [[number], number] = this.toFields(element);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let indirection: any = this.mapping;
        for (const field of fields[0]) {
            if (indirection[field] === undefined) {
                indirection[field] = [];
            }
            indirection = indirection[field];
        }
        const finalField: number = fields[1];
        if (indirection[finalField] === undefined) {
            indirection[finalField] = true;
            this.values.push(element);
            return true;
        } else {
            return false;
        }
    }
    public contains(element: T): boolean {
        const fields: [[number], number] = this.toFields(element);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let indirection: any = this.mapping;
        for (const field of fields[0]) {
            if (indirection[field] === undefined) {
                return false;
            }
            indirection = indirection[field];
        }
        const finalField: number = fields[1];
        return indirection[finalField] !== undefined;
    }
    [Symbol.iterator](): IterableIterator<T> {
        return this.values.values();
    }
}

export class CoordSet extends OptimizedSet<Coord> {
    protected toFields(coord: Coord): [[number], number] {
        return [[coord.y], coord.x];
    }
}
