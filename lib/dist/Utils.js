"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const MGPValidation_1 = require("./MGPValidation");
class Utils {
    /**
     * The error logger is called in order to log errors when they arise.
     * It should be set by the codebase relying on this, for example by doing:
     * Utils.logError = myErrorLogger;
     */
    static logError = (_kind, message, _data) => {
        return MGPValidation_1.MGPValidation.failure(message);
    };
    static expectToBe(value, expected, message) {
        if (value !== expected) {
            if (message !== undefined) {
                throw new Error(message);
            }
            throw new Error(`A default switch case did not observe the correct value, expected ${expected}, but got ${value} instead.`);
        }
    }
    static expectToBeMultiple(value, expectedValues) {
        for (const expected of expectedValues) {
            if (value === expected) {
                return;
            }
        }
        // No value found!
        throw new Error(`A default switch case did not observe the correct value, expected a value among ${expectedValues}, but got ${value} instead.`);
    }
    static getNonNullable(value) {
        if (value == null) {
            throw new Error(`Expected value not to be null or undefined, but it was.`);
        }
        else {
            return value;
        }
    }
    static assert(condition, message, data) {
        if (condition === false) {
            // We log the error but we also throw an exception
            // This is because if an assertion fails,
            // we don't want to execute the code after the assertion.
            // Otherwise, this could result in potentially very serious issues.
            Utils.logError('Assertion failure', message, data);
            throw new Error(`Assertion failure: ${message}`);
        }
    }
    static identity(thing) {
        return thing;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map