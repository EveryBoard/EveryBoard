import { MGPOptional } from '../MGPOptional';

describe('MGPOptional', () => {
    it('MGPOptional should not be create with empty value', () => {
        expect(() => MGPOptional.of(null))
            .toThrowError('Optional cannot be create with empty value, use MGPOptional.empty instead');
    });
    it('MGPOptional.get should throw if empty', () => {
        const optional: MGPOptional<string> = MGPOptional.empty();
        expect(() => optional.get()).toThrowError('Value is absent');
    });
    describe('toString', () => {
        it('should succeed for empty values', () => {
            expect(MGPOptional.empty<string>().toString()).toBe('MGPOptional.empty()');
        });
        it('should rely include value for non-empty values', () => {
            expect(MGPOptional.of('foo').toString()).toBe('MGPOptional.of(foo)');
        });
    });
});
