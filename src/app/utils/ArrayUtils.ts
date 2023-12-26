import { Coord } from '../jscaip/Coord';
import { Comparable, comparableEquals } from './Comparable';
import { MGPMap } from './MGPMap';
import { MGPOptional } from './MGPOptional';
import { Utils } from './utils';

export class ArrayUtils {

    public static create<T>(width: number, initValue: T): T[] {
        const array: Array<T> = [];
        for (let x: number = 0; x < width; x++) {
            array.push(initValue);
        }
        return array;
    }

    public static copy<T>(array: ReadonlyArray<T>): T[] {
        return array.map((t: T): T => t);
    }

    public static sortByDescending<T>(array: T[], by: (t: T) => number): void {
        array.sort((t1: T, t2: T): number => {
            const v1: number = by(t1);
            const v2: number = by(t2);
            if (v1 < v2) {
                return 1; // sort from higher to lower
            } else if (v1 > v2) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    public static equals<T extends Comparable>(t1: ReadonlyArray<T>, t2: ReadonlyArray<T>): boolean {
        if (t1.length !== t2.length) return false;
        for (let i: number = 0; i < t1.length; i++) {
            if (comparableEquals(t1[i], t2[i]) === false) return false;
        }
        return true;
    }

    public static isPrefix<T extends Comparable>(prefix: ReadonlyArray<T>, list: ReadonlyArray<T>): boolean {
        if (prefix.length > list.length) return false;
        return ArrayUtils.equals(prefix, list.slice(0, prefix.length));
    }

    /**
     * range(n) returns the list [0, 1, 2, ..., n-1]
     * Enables doing *ngFor="let x in ArrayUtils.range(5)" in an Angular template
     */
    public static range(n: number): number[] {
        const range: number[] = [];
        for (let i: number = 0; i < n; i++) {
            range.push(i);
        }
        return range;
    }

    /**
     * A method that can be used to sort an array with the smallest number first with xs.sort(ArrayUtils.smallerFirst);
     */
    public static smallerFirst(a: number, b: number): number {
        return a-b;
    }

    /**
     * Gets a random element from an array.
     * Throws if the array is empty.
     */
    public static getRandomElement<T>(array: T[]): T {
        Utils.assert(array.length > 0, 'ArrayUtils.getRandomElement must be called on an array containing elements');
        const randomIndex: number = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }


    /**
     * Gets the maximum elements of an array, according to a given metric.
     * Returns an array containing all the maximal values
     */
    public static maximumsBy<T>(array: T[], metric: (value: T) => number): T[] {
        let maximums: T[] = [];
        let maxMetricValue: number = -Infinity;
        for (const element of array) {
            const currentMetricValue: number = metric(element);
            if (currentMetricValue >= maxMetricValue) {
                if (currentMetricValue > maxMetricValue) {
                    maximums = [];
                }
                maxMetricValue = currentMetricValue;
                maximums.push(element);
            }
        }
        return maximums;
    }

    public static count<T>(array: T[], value: T): number {
        let total: number = 0;
        for (const element of array) {
            if (comparableEquals(element, value)) {
                total++;
            }
        }
        return total;
    }

    public static isInferior(inferior: ReadonlyArray<number>, superior: ReadonlyArray<number>): boolean {
        Utils.assert(inferior.length > 0 && superior.length > 0, 'ArrayUtils.isInferior/isSuperior should have two non-empty list as parameter');
        const maximumIndex: number = Math.min(inferior.length, superior.length);
        for (let i: number = 0; i < maximumIndex; i++) {
            if (superior[i] !== inferior[i]) { // We found an inequality
                return inferior[i] < superior[i];
            }
        }
        return false; // They are equal
    }

    public static isSuperior(superior: ReadonlyArray<number>, inferior: ReadonlyArray<number>): boolean {
        return ArrayUtils.isInferior(inferior, superior);
    }

    public static min(left: ReadonlyArray<number>, right: ReadonlyArray<number>): ReadonlyArray<number> {
        if (ArrayUtils.isInferior(left, right)) {
            return left;
        } else {
            return right;
        }
    }

    public static max(left: ReadonlyArray<number>, right: ReadonlyArray<number>): ReadonlyArray<number> {
        if (ArrayUtils.isSuperior(left, right)) {
            return left;
        } else {
            return right;
        }
    }

}

export type Table<T> = ReadonlyArray<ReadonlyArray<T>>;

export class TableUtils {

    public static create<T>(width: number, height: number, initValue: T): T[][] {
        const table: Array<Array<T>> = [];
        for (let y: number = 0; y < height; y++) {
            table.push(ArrayUtils.create(width, initValue));
        }
        return table;
    }

    public static map<T, U>(table: Table<T>, fun: (t: T) => U): U[][] {
        return table.map((row: T[]): U[] => row.map(fun));
    }

    public static copy<T>(table: Table<T>): T[][] {
        return TableUtils.map(table, (t: T): T => t);
    }

    public static compare<T extends Comparable>(t1: Table<T>, t2: Table<T>): boolean {
        if (t1.length !== t2.length) return false;
        for (let i: number = 0; i < t1.length; i++) {
            if (ArrayUtils.equals(t1[i], t2[i]) === false) return false;
        }
        return true;
    }

}

export type Cell<T> = {
    x: number,
    y: number,
    content: T,
};

export class TableWithPossibleNegativeIndices<T extends NonNullable<unknown>> {
    // This cannot be represented by an array as it may have negative indices
    // which cannot be iterated over
    protected content: MGPMap<number, MGPMap<number, T>> = new MGPMap();

    public get(coord: Coord): MGPOptional<T> {
        const line: MGPOptional<MGPMap<number, T>> = this.content.get(coord.y);
        if (line.isAbsent()) return MGPOptional.empty();
        return line.get().get(coord.x);
    }
    public set(coord: Coord, value: T): void {
        const lineOpt: MGPOptional<MGPMap<number, T>> = this.content.get(coord.y);
        let line: MGPMap<number, T>;
        if (lineOpt.isPresent()) {
            line = lineOpt.get();
        } else {
            line = new MGPMap<number, T>();
            this.content.set(coord.y, line);
        }
        line.set(coord.x, value);
    }
    [Symbol.iterator](): IterableIterator<Cell<T>> {
        const elements: Cell<T>[] = [];
        const ys: number[] = this.content.getKeySet().toList();
        ys.sort(ArrayUtils.smallerFirst);
        for (const y of ys) {
            const line: MGPMap<number, T> = this.content.get(y).get();
            const xs: number[] = line.getKeySet().toList();
            xs.sort(ArrayUtils.smallerFirst);
            for (const x of xs) {
                const content: T = line.get(x).get();
                elements.push({ x, y, content });
            }
        }
        return elements.values();
    }
}

export class Table3DUtils {

    public static create<T>(depth: number, width: number, height: number, initValue: T): T[][][] {
        const triTable: Array<Array<Array<T>>> = [];
        for (let z: number = 0; z < depth; z++) {
            triTable.push(TableUtils.create(width, height, initValue));
        }
        return triTable;
    }
}
