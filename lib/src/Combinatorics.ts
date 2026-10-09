import { Utils } from './Utils';

export class Combinatorics {

    public static getCombinations<T>(elements: T[], size: number): T[][] {
        Utils.assert(size <= elements.length, 'cannot compute combinations for less elements than needed');
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
                const element: T = elements[i];
                elements[i] = elements[k];
                elements[k] = element;
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

    public static getSubsetsOfSize<T>(list: T[], size: number): T[][] {
        function subsets(subsetSize: number, start: number): T[][] {
            if (subsetSize === 0) {
                return [[]]; // the only possible subset of size zero is the empty set
            } else if (subsetSize < 0) {
                return []; // No subset can be of negative size
            }
            if (list.length <= start) {
                return []; // No more subsets
            }
            const results: T[][] = [];
            while (start <= list.length - subsetSize) {
                const first: T = list[start];
                for (const subset of subsets(subsetSize - 1, start + 1)) {
                    subset.push(first);
                    results.push(subset);
                }
                ++start;
            }
            return results;
        }
        return subsets(size, 0);
    }

}
