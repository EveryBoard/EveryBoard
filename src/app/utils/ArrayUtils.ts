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
    public static createBiArray<T>(width: number, height: number, initValue: T): T[][] {
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
}
