"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Combinatorics = void 0;
const Utils_1 = require("./Utils");
class Combinatorics {
    static getCombinations(elements, size) {
        Utils_1.Utils.assert(size <= elements.length, 'cannot compute combinations for less elements than needed');
        return this.getSubsetsOfSize(elements, size).map((subset) => {
            return this.getPermutations(subset);
        }).reduce((accumulator, combinations) => {
            return accumulator.concat(combinations);
        });
    }
    static getPermutations(elements) {
        // Uses Heap's algorithm to compute all permutations of `elements`
        const length = elements.length;
        const result = [elements.slice()];
        const c = new Array(length).fill(0);
        let i = 1;
        while (i < length) {
            if (c[i] < i) {
                const k = i % 2 && c[i];
                const element = elements[i];
                elements[i] = elements[k];
                elements[k] = element;
                ++c[i];
                i = 1;
                result.push(elements.slice());
            }
            else {
                c[i] = 0;
                ++i;
            }
        }
        return result;
    }
    static getSubsetsOfSize(elements, size) {
        function subsets(length, start) {
            if (elements.length <= start || length < 1) {
                return [[]];
            }
            else {
                const results = [];
                while (start <= elements.length - length) {
                    const first = elements[start];
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
exports.Combinatorics = Combinatorics;
//# sourceMappingURL=Combinatorics.js.map