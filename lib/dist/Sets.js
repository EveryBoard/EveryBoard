"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sets = void 0;
const Comparable_1 = require("./Comparable");
class Sets {
    static toComparableObjectSet(list) {
        const result = [];
        list.forEach((other) => {
            if (result.some((el) => el.equals(other)) === false) {
                result.push(other);
            }
        });
        return result;
    }
    static toComparableSet(list) {
        const result = [];
        list.forEach((other) => {
            if (result.some((el) => (0, Comparable_1.comparableEquals)(el, other)) === false) {
                result.push(other);
            }
        });
        return result;
    }
}
exports.Sets = Sets;
//# sourceMappingURL=Sets.js.map