import { MGPFallible } from '../MGPFallible';
import { MGPOptional } from '../MGPOptional';

describe('MGPFallible', () => {

    describe('success', () => {
        const value: MGPFallible<number> = MGPFallible.success(42);
        it('should create a success value', () => {
            expect(value.isSuccess()).toBeTrue();
            expect(value.isFailure()).toBeFalse();
        });
        it('should have value accessible with get', () => {
            expect(value.get()).toBe(42);
        });
        it('should throw when accessing the failure reason', () => {
            expect(() => value.getReason())
                .toThrowError('Cannot get failure reason from a success');
        });
        it('should convert to an optional with the same value', () => {
            expect(value.toOptional()).toEqual(MGPOptional.of(42));
        });
        it('should extract the passed value with getReasonOr', () => {
            expect(value.getReasonOr('foo')).toBe('foo');
        });
        it('should have a well-defined equality', () => {
            expect(value.equals(value)).toBeTrue();
            expect(value.equals(MGPFallible.success(41))).toBeFalse();
            expect(value.equals(MGPFallible.failure('foo'))).toBeFalse();
        });
        it('should be convertible to string', () => {
            expect(value.toString()).toBe('MGPFallible.success(42)');
        });
    });
    describe('failure', () => {
        const value: MGPFallible<number> = MGPFallible.failure('reason');
        it('should create a failure value', () => {
            expect(value.isSuccess()).toBeFalse();
            expect(value.isFailure()).toBeTrue();
        });
        it('should throw when accessing value with get', () => {
            expect(() => value.get()).toThrowError('Value is absent from failure, with the following reason: reason');
        });
        it('should contain the failure reason', () => {
            expect(value.getReason()).toBe('reason');
        });
        it('should convert to an empty optional', () => {
            expect(value.toOptional()).toEqual(MGPOptional.empty());
        });
        it('should extract the reason with getReasonOr', () => {
            expect(value.getReasonOr('foo')).toBe('reason');
        });
        it('should have a well-defined equality', () => {
            expect(value.equals(value)).toBeTrue();
            expect(value.equals(MGPFallible.success(41))).toBeFalse();
            expect(value.equals(MGPFallible.failure('other reason'))).toBeFalse();
        });
        it('should give the reason with toString', () => {
            expect(value.toString()).toBe('MGPFallible.failure(reason)');
        });
    });
});
