"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestUtils = void 0;
const MGPValidation_1 = require("./MGPValidation");
const Utils_1 = require("./Utils");
class TestUtils {
    static expectToThrowAndLog(func, error) {
        if (jasmine.isSpy(Utils_1.Utils.logError) === false) {
            spyOn(Utils_1.Utils, 'logError').and.callFake((component, message) => MGPValidation_1.MGPValidation.failure(component + ': ' + message));
        }
        expect(func)
            .withContext('Expected Assertion failure: ' + error)
            .toThrowError('Assertion failure: ' + error);
        expect(Utils_1.Utils.logError).toHaveBeenCalledWith('Assertion failure', error, undefined);
    }
}
exports.TestUtils = TestUtils;
//# sourceMappingURL=TestUtils.js.map