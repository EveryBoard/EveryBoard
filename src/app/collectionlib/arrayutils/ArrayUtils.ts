export class ArrayUtils {

    public static mapImmutableBiArray<T, U>(array: T[][], mapper: (t: T) => U): U[][] {
        const result: U[][] = [];
        let y: number = 0;
        while (y < array.length) {
            result[y] = [];
            let x: number = 0;
            while (x < array[y].length) {
                result[y][x] = mapper(array[y][x]);
                x++;
            }
            y++
        }
        return result;
    }
}