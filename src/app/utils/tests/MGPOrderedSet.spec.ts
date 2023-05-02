import { MGPOrderedSet } from '../MGPOrderedSet';

fdescribe('MGPOrderedSet', () => {
    describe('equals', () => {
        it('should test size', () => {
            const one: MGPOrderedSet<string> = new MGPOrderedSet(['salut']);
            const two: MGPOrderedSet<string> = new MGPOrderedSet(['salut', 'kutentak']);
            expect(one.equals(two)).toBeFalse();
        });
        it('should care about order', () => {
            const one: MGPOrderedSet<string> = new MGPOrderedSet(['un', 'deux']);
            const two: MGPOrderedSet<string> = new MGPOrderedSet(['deux', 'un']);
            expect(one.equals(two)).toBeFalse();
        });
        it('should detect inequality', () => {
            const one: MGPOrderedSet<string> = new MGPOrderedSet(['un', 'deux']);
            const two: MGPOrderedSet<string> = new MGPOrderedSet(['deux', 'trois']);
            expect(one.equals(two)).toBeFalse();
        });
        it('should detect equality', () => {
            const one: MGPOrderedSet<string> = new MGPOrderedSet(['un', 'deux']);
            const two: MGPOrderedSet<string> = new MGPOrderedSet(['un', 'deux']);
            expect(one.equals(two)).toBeTrue();
        });
    });
});
