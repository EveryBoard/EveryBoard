import { MGPMap } from '../MGPMap';
import { MGPOptional } from '../MGPOptional';

describe('MGPMap', () => {

    it('Set should bug if key value was already present', () => {
        const map: MGPMap<string, string> = new MGPMap();
        map.set('oui', 'yes');
        expect(() => map.set('oui', 'si')).toThrow();
    });
    it('Put should replace value if key value was already present', () => {
        const map: MGPMap<string, string> = new MGPMap();
        map.put('oui', 'yes');
        expect(() => map.put('oui', 'DA')).not.toThrow();
        expect(map.get('oui')).toEqual(MGPOptional.of('DA'));
    });
    it('ListKey should work', () => {
        const map: MGPMap<string, number> = new MGPMap();
        map.set('first', 1);
        map.set('second', 2);

        expect(map.listKeys()).toEqual(['first', 'second']);
    });
    describe('replace', () => {
        it('Replace should work', () => {
            const map: MGPMap<string, number> = new MGPMap();
            map.set('first', 1);
            map.replace('first', 0);

            expect(map.get('first')).toEqual(MGPOptional.of(0));
        });
        it('Replace should throw when value not found', () => {
            const map: MGPMap<string, number> = new MGPMap();
            map.set('first', 1);

            expect(() => map.replace('firstZUUU', 0))
                .toThrowError('No Value to replace for key firstZUUU!');
        });
    });
    describe('delete', () => {
        it('Should delete element', () => {
            const map: MGPMap<string, number> = new MGPMap();
            map.set('first', 0);
            map.set('second', 1);
            map.set('third', 2);
            map.delete('first');

            expect(map.get('first')).toEqual(MGPOptional.empty());
        });
        it('Should throw when unexisting key passed', () => {
            const map: MGPMap<string, number> = new MGPMap();
            map.set('first', 0);
            expect(() => map.delete('second')).toThrowError('No Value to delete for key "second"!');
        });
    });
    it('GetByIndex should give them by order of input', () => {
        const map: MGPMap<string, number> = new MGPMap();
        map.set('first', 0);
        map.set('second', 1);
        map.set('third', 2);
        expect(map.getByIndex(1).value).toBe(1);
    });
    it('Should throw when calling set after making immutable', () => {
        const map: MGPMap<string, number> = new MGPMap();
        map.set('first', 0);
        map.set('second', 1);
        map.makeImmutable();
        expect(() => map.set('third', 2)).toThrowError('Cannot call set on immutable map!');
    });
    it('PutAll should concantenate two maps, erasing the overlapping content on the receiver', () => {
        const receiver: MGPMap<string, number> = new MGPMap();
        receiver.set('first', 0);
        receiver.set('second', 1);

        const giver: MGPMap<string, number> = new MGPMap();
        giver.set('first', 1);
        giver.set('third', 3);

        receiver.putAll(giver);

        const expectedSum: MGPMap<string, number> = new MGPMap();
        expectedSum.set('first', 1);
        expectedSum.set('second', 1);
        expectedSum.set('third', 3);

        expect(receiver).toEqual(expectedSum);
    });
    it('Size should work', () => {
        const map: MGPMap<string, number> = new MGPMap();
        expect(map.size()).toBe(0);
    });
    describe('copy', () => {
        it('Copy should be identical when no immutable', () => {
            const map: MGPMap<string, number> = new MGPMap();
            map.set('first', 0);
            map.set('second', 1);

            const copy: MGPMap<string, number> = map.getCopy();
            expect(copy).toEqual(map);

            map.set('third', 2);
            expect(copy).not.toEqual(map);
        });
        it('Copy should bethe same but mutable when immutable', () => {
            const map: MGPMap<string, number> = new MGPMap();
            map.set('first', 0);
            map.set('second', 1);

            const copy: MGPMap<string, number> = map.getCopy();
            map.makeImmutable();

            expect(copy).not.toEqual(map);
            copy.makeImmutable();
            expect(copy).toEqual(map);
        });
    });
    describe('equals', () => {
        it('should detect maps with distinct keys as different', () => {
            const map1: MGPMap<string, number> = new MGPMap();
            map1.set('first', 0);

            const map2: MGPMap<string, number> = new MGPMap();
            map2.set('second', 1);

            expect(map1.equals(map2)).toBeFalse();
        });
        it('should detect map with same keys but distinct values as different', () => {
            const map1: MGPMap<string, number> = new MGPMap();
            map1.set('first', 0);

            const map2: MGPMap<string, number> = new MGPMap();
            map2.set('first', 1);

            expect(map1.equals(map2)).toBeFalse();
        });
    });
});
