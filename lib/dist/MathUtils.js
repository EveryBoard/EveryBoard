"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathUtils = void 0;
class MathUtils {
    /**
     * Returns the greatest common divisor between two numbers a and b.
     * Uses the euclidean algorithm. Negative inputs are supported.
     */
    static gcd(a, b) {
        if (b === 0) {
            return Math.abs(a);
        }
        else {
            return MathUtils.gcd(b, a % b);
        }
    }
}
exports.MathUtils = MathUtils;
//# sourceMappingURL=MathUtils.js.map