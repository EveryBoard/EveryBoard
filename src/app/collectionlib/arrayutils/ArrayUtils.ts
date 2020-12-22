export type ReadonlyBiArray<T> = ReadonlyArray<ReadonlyArray<T>>;
export type ReadonlyNumberBiArray = ReadonlyBiArray<number>;

export class ArrayUtils {
    public static mapBiArray<T, U>(biArray: ReadonlyArray<ReadonlyArray<T>>, mapper: (t: T) => U): U[][] {
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
        let y = height - 1;
        while (y >= 0) {
            retour[y] = [];
            let x = width - 1;
            while (x >= 0) {
                retour[y][x] = initValue;
                x--;
            }
            y--;
        }
        return retour;
    }
    public static setAllValueTo(board: number[][], value: number) {
        let y = board.length - 1;
        while (y >= 0) {
            let x = board[y].length - 1;
            while (x >= 0) {
                board[y][x] = value;
                x--;
            }
            y--;
        }
    }
    public static copyBiArray<T>(biArray: ReadonlyArray<ReadonlyArray<T>>): T[][] {
        const retour: Array<Array<T>> = [];
        let y = 0;
        while (y < biArray.length) {
            retour[y] = ArrayUtils.copyArray<T>(biArray[y]);
            y++;
        }
        return retour;
    }
    public static copyImmutableArray<I>(array: ReadonlyArray<I>): I[] {
        const retour: Array<I> = [];
        let x = 0;
        while (x < array.length) {
            retour[x] = array[x];
            x++;
        }
        return retour;
    }
    public static copyArray<T>(array: ReadonlyArray<T>): T[] { // TODO: REMOVE FOR copyImmutableArray
        const retour: Array<T> = [];
        let x = 0;
        while (x < array.length) {
            retour[x] = array[x];
            x++;
        }
        return retour;
    }
}
