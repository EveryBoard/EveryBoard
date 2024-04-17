"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedSet = void 0;
const MGPSet_1 = require("./MGPSet");
/**
 * This is an optimized representation of sets.
 * It performs multi-level hashing and is suitable for types
 * that can be decomposed into multiple fields represented by numbers.
 */
class OptimizedSet extends MGPSet_1.MGPSet {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    valueMap;
    constructor(values) {
        super();
        this.valueMap = [];
        this.values = [];
        if (values !== undefined) {
            for (const value of values) {
                this.add(value);
            }
        }
    }
    add(element) {
        const fields = this.toFields(element);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let indirection = this.valueMap;
        for (const field of fields[0]) {
            if (indirection[field] === undefined) {
                indirection[field] = [];
            }
            indirection = indirection[field];
        }
        const finalField = fields[1];
        if (indirection[finalField] === undefined) {
            indirection[finalField] = true;
            this.values.push(element);
            return true;
        }
        else {
            return false;
        }
    }
    contains(element) {
        const fields = this.toFields(element);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let indirection = this.valueMap;
        for (const field of fields[0]) {
            if (indirection[field] === undefined) {
                return false;
            }
            indirection = indirection[field];
        }
        const finalField = fields[1];
        return indirection[finalField] !== undefined;
    }
    [Symbol.iterator]() {
        return this.values.values();
    }
}
exports.OptimizedSet = OptimizedSet;
//# sourceMappingURL=OptimizedSet.js.map