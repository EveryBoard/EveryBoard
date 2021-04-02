import { MGPStr } from '../mgp-str/MGPStr';
import { MGPSet } from './MGPSet';

describe('MGPSet', () => {
    describe('equals', () => {
        it('Should test size', () => {
            const one: MGPSet<MGPStr> = new MGPSet([new MGPStr('salut')]);
            const two: MGPSet<MGPStr> = new MGPSet([new MGPStr('salut'), new MGPStr('salut')]);
            expect(one.equals(two)).toBeFalse();
        });
        it('Should not care about order', () => {
            const one: MGPSet<MGPStr> = new MGPSet([new MGPStr('un'), new MGPStr('deux')]);
            const two: MGPSet<MGPStr> = new MGPSet([new MGPStr('deux'), new MGPStr('un')]);
            expect(one.equals(two)).toBeTrue();
        });
    });
});
