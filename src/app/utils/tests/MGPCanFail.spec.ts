import { MGPCanFail } from '../MGPCanFail';
import { MGPOptional } from '../MGPOptional';

describe('MGPCanFail', () => {
    describe('success', () => {
        const value: MGPCanFail<number> = MGPCanFail.success(42);
        it('should not accept null values', () => {
            expect(() => MGPCanFail.success(null))
                .toThrowError('CanFail cannot be created with empty value, use MGPCanFail.failure instead');
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
            expect(value.equals(MGPCanFail.success(41))).toBeFalse();
            expect(value.equals(MGPCanFail.failure('foo'))).toBeFalse();
        });
    });
    describe('failure', () => {
        const value: MGPCanFail<number> = MGPCanFail.failure('reason');
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
            expect(value.equals(MGPCanFail.success(41))).toBeFalse();
            expect(value.equals(MGPCanFail.failure('other reason'))).toBeFalse();
        })
    });;
});
