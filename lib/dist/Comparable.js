"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparableEquals = exports.isComparableValue = exports.isComparableJSON = exports.isComparableObject = void 0;
const JSON_1 = require("./JSON");
function comparableEqualsStrict(a, b) {
    if (a != null && b != null && typeof a === 'object') {
        if (a.equals != null) {
            const comparableValue = a;
            const otherComparable = b;
            return comparableValue.equals(otherComparable);
        }
        else {
            const aJSON = a;
            const bJSON = b;
            for (const key of Object.keys(aJSON)) {
                if (key in bJSON) {
                    if (comparableEqualsStrict(aJSON[key], bJSON[key]) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            return true;
        }
    }
    else {
        return a === b;
    }
}
function isComparableObject(value) {
    // eslint-disable-next-line dot-notation
    return typeof value === 'object' && value != null && value['equals'] != null;
}
exports.isComparableObject = isComparableObject;
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
function isComparableJSON(value) {
    if (typeof value === 'object') {
        for (const key in value) {
            if (value[key] != null && isComparableValue(value[key]) === false) {
                return false;
            }
        }
        // A JSON value should directly inherit from Object
        return value != null && value.constructor.prototype === Object.prototype;
    }
    else {
        return false;
    }
}
exports.isComparableJSON = isComparableJSON;
function isComparableValue(value) {
    return value == null || isComparableObject(value) || (0, JSON_1.isJSONPrimitive)(value) || isComparableJSON(value);
}
exports.isComparableValue = isComparableValue;
function comparableEquals(a, b) {
    if (isComparableValue(a) && isComparableValue(b)) {
        return comparableEqualsStrict(a, b);
    }
    else {
        // eslint-disable-next-line @typescript-eslint/ban-types
        throw new Error(`Comparing non comparable objects: ${a.constructor.name} and ${b.constructor.name}`);
    }
}
exports.comparableEquals = comparableEquals;
//# sourceMappingURL=Comparable.js.map