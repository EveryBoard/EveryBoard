import { MGPSet } from './MGPSet';

describe('MGPSet', () => {
    describe('equals', () => {
        it('Should test size', () => {
            const one: MGPSet<string> = new MGPSet(['salut']);
            const two: MGPSet<string> = new MGPSet(['salut', 'kutentak']);
            expect(one.equals(two)).toBeFalse();
        });
        it('Should not care about order', () => {
            const one: MGPSet<string> = new MGPSet(['un', 'deux']);
            const two: MGPSet<string> = new MGPSet(['deux', 'un']);
            expect(one.equals(two)).toBeTrue();
        });
    });
});
