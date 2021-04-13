import { NumberEncoder } from './encoder';

describe('NumberEncoder', () => {
    describe('booleanEncoder', () => {
        const encoder: NumberEncoder<boolean> = NumberEncoder.booleanEncoder;
        it('should successfully encode and decode all booleans', () => {
            expect(encoder.decodeNumber(encoder.encodeNumber(true))).toBe(true);
            expect(encoder.decodeNumber(encoder.encodeNumber(false))).toBe(false);
        });
        it('should fail when decoding invalid encoded booleans', () => {
            expect(() => encoder.decodeNumber(42)).toThrow();
        });
    });
});
