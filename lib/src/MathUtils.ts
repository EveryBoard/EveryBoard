export class MathUtils {
    /**
     * Returns the greatest common divisor between two numbers a and b.
     * Uses the euclidean algorithm. Negative inputs are supported.
     */
    public static gcd(a: number, b: number): number {
        if (b === 0) {
            return Math.abs(a);
        } else {
            return MathUtils.gcd(b, a % b);
        }
    }
}
