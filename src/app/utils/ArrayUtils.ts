import { Comparable, comparableEquals } from './Comparable';

export type Table<T> = ReadonlyArray<ReadonlyArray<T>>;

export type NumberTable = Table<number>;

export class ArrayUtils {

    public static mapBiArray<T, U>(biArray: Table<T>, mapper: (t: T) => U): U[][] {
        const result: U[][] = [];
        let y: number = 0;
        while (y < biArray.length) {
            result[y] = [];
            let x: number = 0;
            while (x < biArray[y].length) {
                result[y][x] = mapper(biArray[y][x]);
                x++;
            }
            y++;
        }
        return result;
    }
    public static createTable<T>(width: number, height: number, initValue: T): T[][] {
        const retour: Array<Array<T>> = [];
        let y: number = height - 1;
        while (y >= 0) {
            retour[y] = [];
            let x: number = width - 1;
            while (x >= 0) {
                retour[y][x] = initValue;
                x--;
            }
            y--;
        }
        return retour;
    }
    public static copyBiArray<T>(biArray: Table<T>): T[][] {
        const retour: Array<Array<T>> = [];
        let y: number = 0;
        while (y < biArray.length) {
            retour[y] = ArrayUtils.copyImmutableArray<T>(biArray[y]);
            y++;
        }
        return retour;
    }
    public static copyImmutableArray<I>(array: ReadonlyArray<I>): I[] {
        const retour: Array<I> = [];
        let x: number = 0;
        while (x < array.length) {
            retour[x] = array[x];
            x++;
        }
        return retour;
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
    public static compareArray<T extends Comparable>(t1: ReadonlyArray<T>, t2: ReadonlyArray<T>): boolean {
        if (t1.length !== t2.length) return false;
        for (let i: number = 0; i < t1.length; i++) {
            if (comparableEquals(t1[i], t2[i]) === false) return false;
        }
        return true;
    }
    public static compareTable<T extends Comparable>(t1: Table<T>, t2: Table<T>): boolean {
        if (t1.length !== t2.length) return false;
        for (let i: number = 0; i < t1.length; i++) {
            if (ArrayUtils.compareArray(t1[i], t2[i]) === false) return false;
        }
        return true;
    }
}
