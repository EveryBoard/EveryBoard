import { MGPOptional } from './MGPOptional';
import { MGPStr } from '../mgp-str/MGPStr';

describe('MGPOptional', () => {
    it('MGPOptional should not be create with empty value', () => {
        expect(() => MGPOptional.of(null)).toThrowError('Optional cannot be create with empty value, use MGPOptional.empty instead');
    });
    it('MGPOptional.get should throw if empty', () => {
        const optional: MGPOptional<MGPStr> = MGPOptional.empty();
        expect(() => optional.get()).toThrowError('Value is absent');
    });
});
