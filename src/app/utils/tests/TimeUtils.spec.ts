import { HumanDuration } from '../TimeUtils';

describe('TimeUtils', () => {
    describe('HumanDuration', () => {
        let pipe: HumanDuration;
        beforeEach(() => {
            pipe = new HumanDuration();
        });
        it('should not fail if duration is 0', () => {
            expect(pipe.transform(0)).toBe('0 secondes');
        });
        it('should produce hours, minutes, and seconds', () => {
            expect(pipe.transform(7322)).toBe('2 heures, 2 minutes et 2 secondes');
        });
        it('should not pluralize if not necessary', () => {
            expect(pipe.transform(3661)).toBe('1 heure, 1 minute et 1 seconde');
        });
        it('should only include elements which are not zero', () => {
            expect(pipe.transform(3600)).toBe('1 heure');
            expect(pipe.transform(60)).toBe('1 minute');
            expect(pipe.transform(15)).toBe('15 secondes');
            expect(pipe.transform(3615)).toBe('1 heure et 15 secondes');
        });
    });
});
