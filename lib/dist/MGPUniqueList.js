"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MGPUniqueList = void 0;
const Comparable_1 = require("./Comparable");
const MGPSet_1 = require("./MGPSet");
const Utils_1 = require("./Utils");
/**
 * This is a list that contains each element only once.
 * It is an ordered set.
 */
class MGPUniqueList extends MGPSet_1.MGPSet {
    equals(other) {
        if (other.size() !== this.size()) {
            return false;
        }
        for (let i = 0; i < this.size(); i++) {
            const otherValue = other.get(i);
            const thisValue = this.get(i);
            if ((0, Comparable_1.comparableEquals)(otherValue, thisValue) === false) {
                return false;
            }
        }
        return true;
    }
    get(index) {
        Utils_1.Utils.assert(index < this.values.length, 'MGPUniqueList: index out of bounds: ' + index);
        return this.values[index];
    }
    /**
      * Get element starting to count from the end (0 for the last)
      * @param index the index of the element to fetch, starting from the end (0 as last)
      */
    getFromEnd(index) {
        Utils_1.Utils.assert(index < this.values.length, 'MGPUniqueList: index (from end) out of bounds: ' + index);
        const lastIndex = this.values.length - 1;
        return this.get(lastIndex - index);
    }
}
exports.MGPUniqueList = MGPUniqueList;
//# sourceMappingURL=MGPUniqueList.js.map