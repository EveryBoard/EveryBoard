"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MGPSet = void 0;
const Comparable_1 = require("./Comparable");
const MGPOptional_1 = require("./MGPOptional");
const Sets_1 = require("./Sets");
class MGPSet {
    values;
    constructor(values) {
        if (values === undefined) {
            this.values = [];
        }
        else {
            this.values = Sets_1.Sets.toComparableSet(values);
        }
    }
    equals(other) {
        if (other.size() !== this.size()) {
            return false;
        }
        for (const coord of this) {
            if (other.contains(coord) === false) {
                return false;
            }
        }
        return true;
    }
    toString() {
        let result = '';
        for (const element of this) {
            if (element == null) {
                result += 'null, ';
            }
            else {
                result += element.toString() + ', ';
            }
        }
        return '[' + result.slice(0, -2) + ']';
    }
    add(element) {
        if (this.contains(element)) {
            return false;
        }
        else {
            this.values.push(element);
            return true;
        }
    }
    /**
     * Remove an element from the set.
     * Returns true if something was actually removed, false otherwise.
     */
    remove(element) {
        for (let i = 0; i < this.values.length; i++) {
            if ((0, Comparable_1.comparableEquals)(this.values[i], element)) {
                this.values.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    addAll(otherSet) {
        for (const element of otherSet) {
            this.add(element);
        }
    }
    union(otherSet) {
        const result = new MGPSet(this.toList());
        result.addAll(otherSet);
        return result;
    }
    contains(element) {
        for (const value of this.values) {
            if ((0, Comparable_1.comparableEquals)(value, element)) {
                return true;
            }
        }
        return false;
    }
    size() {
        return this.values.length;
    }
    toList() {
        const result = [];
        for (const value of this) {
            result.push(value);
        }
        return result;
    }
    getAnyElement() {
        if (this.size() > 0) {
            return MGPOptional_1.MGPOptional.of(this.values[0]);
        }
        else {
            return MGPOptional_1.MGPOptional.empty();
        }
    }
    isEmpty() {
        return this.values.length === 0;
    }
    hasElements() {
        return this.isEmpty() === false;
    }
    map(mapper) {
        const result = [];
        for (const element of this.values) {
            result.push(mapper(element));
        }
        return new MGPSet(result);
    }
    flatMap(f) {
        const result = new MGPSet();
        for (const element of this) {
            result.addAll(f(element));
        }
        return result;
    }
    filter(f) {
        const result = new MGPSet();
        for (const element of this) {
            if (f(element)) {
                result.add(element);
            }
        }
        return result;
    }
    findAnyCommonElement(other) {
        for (const element of other) {
            if (this.contains(element)) {
                return MGPOptional_1.MGPOptional.of(element);
            }
        }
        return MGPOptional_1.MGPOptional.empty();
    }
    intersection(other) {
        const result = new MGPSet();
        for (const element of other) {
            if (this.contains(element)) {
                result.add(element);
            }
        }
        return result;
    }
    /**
     * @param other the "reference" set
     * @returns an empty optional is nothing miss in this set; the first element missing as an optional if there is one
     */
    getMissingElementFrom(other) {
        for (const element of other) {
            if (this.contains(element) === false) {
                return MGPOptional_1.MGPOptional.of(element);
            }
        }
        return MGPOptional_1.MGPOptional.empty();
    }
    [Symbol.iterator]() {
        return this.values.values();
    }
}
exports.MGPSet = MGPSet;
//# sourceMappingURL=MGPSet.js.map