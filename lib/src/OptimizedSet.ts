import { Comparable } from './Comparable';
import { Set } from './Set';

/**
 * This is an optimized representation of sets.
 * It performs multi-level hashing and is suitable for types
 * that can be decomposed into multiple fields represented by numbers.
 */
export abstract class OptimizedSet<T extends Comparable> extends Set<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly valueMap: T[];

    /**
     * This should be defined for each specialization of OptimizedSet.
     * It transforms a value into a list of fields.
     * There should be at least one field, which is the second element returned.
     * The first element returned is the list of other fields.
     */
    protected abstract toFields(value: T): [[number], number];

    public constructor(values?: readonly T[]) {
        super();
        this.valueMap = [];
        this.values = [];
        if (values !== undefined) {
            for (const value of values) {
                this.add(value);
            }
        }
    }

    private add(element: T): boolean {
        const fields: [[number], number] = this.toFields(element);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let indirection: any = this.valueMap;
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

    public override contains(element: T): boolean {
        const fields: [[number], number] = this.toFields(element);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let indirection: any = this.valueMap;
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
