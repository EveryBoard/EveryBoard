"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayUtils = void 0;
const Comparable_1 = require("./Comparable");
const Utils_1 = require("./Utils");
class ArrayUtils {
    static create(width, initValue) {
        const array = [];
        for (let x = 0; x < width; x++) {
            array.push(initValue);
        }
        return array;
    }
    static copy(array) {
        return array.map((t) => t);
    }
    static sortByDescending(array, by) {
        array.sort((t1, t2) => {
            const v1 = by(t1);
            const v2 = by(t2);
            if (v1 < v2) {
                return 1; // sort from higher to lower
            }
            else if (v1 > v2) {
                return -1;
            }
            else {
                return 0;
            }
        });
    }
    static equals(t1, t2) {
        if (t1.length !== t2.length) {
            return false;
        }
        for (let i = 0; i < t1.length; i++) {
            if ((0, Comparable_1.comparableEquals)(t1[i], t2[i]) === false)
                return false;
        }
        return true;
    }
    static isPrefix(prefix, list) {
        if (prefix.length > list.length)
            return false;
        return ArrayUtils.equals(prefix, list.slice(0, prefix.length));
    }
    /**
     * range(n) returns the list [0, 1, 2, ..., n-1]
     * Enables doing *ngFor="let x in ArrayUtils.range(5)" in an Angular template
     */
    static range(n) {
        const range = [];
        for (let i = 0; i < n; i++) {
            range.push(i);
        }
        return range;
    }
    /**
     * A method that can be used to sort an array with the smallest number first with xs.sort(ArrayUtils.smallerFirst);
     */
    static smallerFirst(a, b) {
        return a - b;
    }
    /**
     * Gets a random element from an array.
     * Throws if the array is empty.
     */
    static getRandomElement(array) {
        Utils_1.Utils.assert(array.length > 0, 'ArrayUtils.getRandomElement must be called on an array containing elements');
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }
    /**
     * Gets the maximum elements of an array, according to a given metric.
     * Returns an array containing all the maximal values
     */
    static maximumsBy(array, metric) {
        let maximums = [];
        let maxMetricValue = -Infinity;
        for (const element of array) {
            const currentMetricValue = metric(element);
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
    /**
     * Counts the number of element in an array that have the provided value
     */
    static count(array, value) {
        let total = 0;
        for (const element of array) {
            if ((0, Comparable_1.comparableEquals)(element, value)) {
                total++;
            }
        }
        return total;
    }
    /**
     * Check whether the first argument is strictly smaller than the second, element-wise
     */
    static isLessThan(inferior, superior) {
        Utils_1.Utils.assert(inferior.length > 0 && superior.length > 0, 'ArrayUtils.isLessThan/isGreaterThan should have two non-empty list as parameter');
        const maximumIndex = Math.min(inferior.length, superior.length);
        for (let i = 0; i < maximumIndex; i++) {
            if (superior[i] !== inferior[i]) { // We found an inequality
                return inferior[i] < superior[i];
            }
        }
        return false; // They are equal
    }
    /**
     * Check whether the first argument is strictly greater than the second, element-wise.
     */
    static isGreaterThan(superior, inferior) {
        return ArrayUtils.isLessThan(inferior, superior);
    }
    /**
     * Return the minimal array (comparing element-wise) between two arrays.
     */
    static min(left, right) {
        if (ArrayUtils.isLessThan(left, right)) {
            return left;
        }
        else {
            return right;
        }
    }
    /**
     * Return the maximal array (comparing element-wise) between two arrays.
     */
    static max(left, right) {
        if (ArrayUtils.isGreaterThan(left, right)) {
            return left;
        }
        else {
            return right;
        }
    }
}
exports.ArrayUtils = ArrayUtils;
//# sourceMappingURL=ArrayUtils.js.map