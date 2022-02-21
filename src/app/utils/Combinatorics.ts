import { assert } from './assert';

export class Combinatorics {
    public static getCombinations<T>(elements: T[], size: number): T[][] {
        assert(elements.length >= size, 'cannot compute combinations for less elements than needed');
        return this.getSubsetsOfSize(elements, size).map((subset: T[]): T[][] => {
            return this.getPermutations(subset);
        }).reduce((accumulator: T[][], combinations: T[][]): T[][] => {
            return accumulator.concat(combinations);
        });
    }
    public static getPermutations<T>(elements: T[]): T[][] {
        // Uses Heap's algorithm to compute all permutations of `elements`
        const length: number = elements.length;
        const result: T[][] = [elements.slice()];
        const c: Array<number> = new Array(length).fill(0);
        let i: number = 1;
        while (i < length) {
            if (c[i] < i) {
                const k: number = i % 2 && c[i];
                const p: T = elements[i];
                elements[i] = elements[k];
                elements[k] = p;
                ++c[i];
                i = 1;
                result.push(elements.slice());
            } else {
                c[i] = 0;
                ++i;
            }
        }
        return result;
    }
    public static getSubsetsOfSize<T>(elements: T[], size: number): T[][] {
        function subsets(length: number, start: number): T[][] {
            if (start >= elements.length || length < 1) {
                return [[]];
            } else {
                const results: T[][] = [];
                while (start <= elements.length - length) {
                    const first: T = elements[start];
                    for (const subset of subsets(length - 1, start + 1)) {
                        subset.push(first);
                        results.push(subset);
                    }
                    ++start;
                }
                return results;
            }
        }
        return subsets(size, 0);
    }

}
