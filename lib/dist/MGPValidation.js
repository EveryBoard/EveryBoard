"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MGPValidationTestUtils = exports.MGPValidation = void 0;
const MGPFallible_1 = require("./MGPFallible");
// eslint-disable-next-line @typescript-eslint/no-redeclare
var MGPValidation;
(function (MGPValidation) {
    MGPValidation.SUCCESS = MGPFallible_1.MGPFallible.success(undefined);
    function ofFallible(fallible) {
        if (fallible.isSuccess()) {
            return MGPValidation.SUCCESS;
        }
        else {
            return MGPValidation.failure(fallible.getReason());
        }
    }
    MGPValidation.ofFallible = ofFallible;
    function failure(reason) {
        return MGPFallible_1.MGPFallible.failure(reason);
    }
    MGPValidation.failure = failure;
})(MGPValidation || (exports.MGPValidation = MGPValidation = {}));
/**
 * This is a helper class to test MGPValidation values
 */
class MGPValidationTestUtils {
    static expectToBeSuccess(fallible, context) {
        if (context != null) {
            expect(fallible.isSuccess()).withContext(context).toBeTrue();
        }
        else {
            expect(fallible.isSuccess()).toBeTrue();
        }
    }
    static expectToBeFailure(fallible, reason) {
        expect(fallible.isFailure()).toBeTrue();
        expect(fallible.getReason()).toBe(reason);
    }
}
exports.MGPValidationTestUtils = MGPValidationTestUtils;
//# sourceMappingURL=MGPValidation.js.map