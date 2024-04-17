"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJSONPrimitive = void 0;
function isJSONPrimitive(value) {
    if (typeof value === 'string')
        return true;
    if (typeof value === 'number')
        return true;
    if (typeof value === 'boolean')
        return true;
    if (value === null)
        return true;
    return false;
}
exports.isJSONPrimitive = isJSONPrimitive;
//# sourceMappingURL=JSON.js.map