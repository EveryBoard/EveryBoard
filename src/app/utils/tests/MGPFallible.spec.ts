import { MGPFallible } from '../MGPFallible';
import { MGPOptional } from '../MGPOptional';

describe('MGPFallible', () => {
    describe('success', () => {
        const value: MGPFallible<number> = MGPFallible.success(42);
        it('should not accept null values', () => {
            expect(() => MGPFallible.success(null))
                .toThrowError('Fallible cannot be created with empty value, use MGPFallible.failure instead');
        });
        it('should create a success value', () => {
            expect(value.isSuccess()).toBeTrue();
            expect(value.isFailure()).toBeFalse();
        });
        it('should have value accessible with get and getOrNull', () => {
            expect(value.get()).toBe(42);
            expect(value.getOrNull()).toBe(42);
        });
        it('should throw when accessing the failure reason', () => {
            expect(() => value.getReason())
                .toThrowError('Cannot getfailure reason from success');
        });
        it('should convert to an optional with the same value', () => {
            expect(value.toOptional()).toEqual(MGPOptional.of(42));
        });
        it('should have a well-defined equality', () => {
            expect(value.equals(value)).toBeTrue();
            expect(value.equals(MGPFallible.success(41))).toBeFalse();
            expect(value.equals(MGPFallible.failure('foo'))).toBeFalse();
        });
    });
    describe('failure', () => {
        const value: MGPFallible<number> = MGPFallible.failure('reason');
        it('should create a failure value', () => {
            expect(value.isSuccess()).toBeFalse();
            expect(value.isFailure()).toBeTrue();
        });
        it('should throw when accessing value with get, and return null with getOrNull', () => {
            expect(() => value.get()).toThrowError('Value is absent from failure');
            expect(value.getOrNull()).toBe(null);
        });
        it('should contain the failure reason', () => {
            expect(value.getReason()).toBe('reason');
        });
        it('should convert to an empty optional', () => {
            expect(value.toOptional()).toEqual(MGPOptional.empty());
        });
        it('should have a well-defined equality', () => {
            expect(value.equals(value)).toBeTrue();
            expect(value.equals(MGPFallible.success(41))).toBeFalse();
            expect(value.equals(MGPFallible.failure('other reason'))).toBeFalse();
        })
    });;
});
