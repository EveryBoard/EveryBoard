import { MGPMap } from './MGPMap';
import { MGPOptional } from '../mgp-optional/MGPOptional';
import { MGPStr } from '../mgp-str/MGPStr';

describe('MGPMap', () => {
    it('Null key should throw error with every method', () => {
        const map: MGPMap<MGPStr, string> = new MGPMap();
        expect(() => map.set(null, '')).toThrowError('Key cannot be null!');
        expect(() => map.put(null, '')).toThrowError('Key cannot be null!');
        expect(() => map.get(null)).toThrowError('Key cannot be null!');
        expect(() => map.replace(null, '')).toThrowError('Key cannot be null!');
        expect(() => map.delete(null)).toThrowError('Key cannot be null!');
    });
    it('Null value should throw error', () => {
        const map: MGPMap<MGPStr, string> = new MGPMap();
        expect(() => map.set(new MGPStr('oui'), null)).toThrowError('Value cannot be null!');
        expect(() => map.put(new MGPStr('oui'), null)).toThrowError('Value cannot be null!');
        expect(() => map.replace(new MGPStr('oui'), null)).toThrowError('Value cannot be null, use delete instead!');
    });
    it('Set should bug if key value was already present', () => {
        const map: MGPMap<MGPStr, string> = new MGPMap();
        map.set(new MGPStr('oui'), 'yes');
        expect(() => map.set(new MGPStr('oui'), 'si')).toThrow();
    });
    it('Put should replace value if key value was already present', () => {
        const map: MGPMap<MGPStr, string> = new MGPMap();
        map.put(new MGPStr('oui'), 'yes');
        expect(() => map.put(new MGPStr('oui'), 'DA')).not.toThrow();
        expect(map.get(new MGPStr('oui'))).toEqual(MGPOptional.of('DA'));
    });
    it('ListKey should work', () => {
        const map: MGPMap<MGPStr, number> = new MGPMap();
        map.set(new MGPStr('first'), 1);
        map.set(new MGPStr('second'), 2);

        expect(map.listKeys()).toEqual([new MGPStr('first'), new MGPStr('second')]);
    });
    describe('replace', () => {
        it('Replace should work', () => {
            const map: MGPMap<MGPStr, number> = new MGPMap();
            map.set(new MGPStr('first'), 1);
            map.replace(new MGPStr('first'), 0);

            expect(map.get(new MGPStr('first'))).toEqual(MGPOptional.of(0));
        });
        it('Replace should throw when value not found', () => {
            const map: MGPMap<MGPStr, number> = new MGPMap();
            map.set(new MGPStr('first'), 1);

            expect(() => map.replace(new MGPStr('firstZUUU'), 0))
                .toThrowError('No Value to replace for key firstZUUU!');
        });
    });
    describe('delete', () => {
        it('Should delete element', () => {
            const map: MGPMap<MGPStr, number> = new MGPMap();
            map.set(new MGPStr('first'), 0);
            map.set(new MGPStr('second'), 1);
            map.set(new MGPStr('third'), 2);
            map.delete(new MGPStr('first'));

            expect(map.get(new MGPStr('first'))).toEqual(MGPOptional.empty());
        });
        it('Should throw when unexisting key passed', () => {
            const map: MGPMap<MGPStr, number> = new MGPMap();
            map.set(new MGPStr('first'), 0);
            expect(() => map.delete(new MGPStr('second'))).toThrowError('No Value to delete for key "second" !');
        });
    });
    it('GetByIndex should give them by order of input', () => {
        const map: MGPMap<MGPStr, number> = new MGPMap();
        map.set(new MGPStr('first'), 0);
        map.set(new MGPStr('second'), 1);
        map.set(new MGPStr('third'), 2);
        expect(map.getByIndex(1).value).toBe(1);
    });
    it('Should throw when calling set after making immutable', () => {
        const map: MGPMap<MGPStr, number> = new MGPMap();
        map.set(new MGPStr('first'), 0);
        map.set(new MGPStr('second'), 1);
        map.makeImmutable();
        expect(() => map.set(new MGPStr('thrid'), 2)).toThrowError('Cannot call set on immutable map!');
    });
    it('PutAll should concantenate two maps, erasing the overlapping content on the receiver', () => {
        const receiver: MGPMap<MGPStr, number> = new MGPMap();
        receiver.set(new MGPStr('first'), 0);
        receiver.set(new MGPStr('second'), 1);

        const giver: MGPMap<MGPStr, number> = new MGPMap();
        giver.set(new MGPStr('first'), 1);
        giver.set(new MGPStr('third'), 3);

        receiver.putAll(giver);

        const expectedSum: MGPMap<MGPStr, number> = new MGPMap();
        expectedSum.set(new MGPStr('first'), 1);
        expectedSum.set(new MGPStr('second'), 1);
        expectedSum.set(new MGPStr('third'), 3);

        expect(receiver).toEqual(expectedSum);
    });
    it('Size should work', () => {
        const map: MGPMap<MGPStr, number> = new MGPMap();
        expect(map.size()).toBe(0);
    });
    describe('copy', () => {
        it('Copy should be identical when no immutable', () => {
            const map: MGPMap<MGPStr, number> = new MGPMap();
            map.set(new MGPStr('first'), 0);
            map.set(new MGPStr('second'), 1);

            const copy: MGPMap<MGPStr, number> = map.getCopy();
            expect(copy).toEqual(map);

            map.set(new MGPStr('third'), 2);
            expect(copy).not.toEqual(map);
        });
        it('Copy should bethe same but mutable when immutable', () => {
            const map: MGPMap<MGPStr, number> = new MGPMap();
            map.set(new MGPStr('first'), 0);
            map.set(new MGPStr('second'), 1);

            const copy: MGPMap<MGPStr, number> = map.getCopy();
            map.makeImmutable();

            expect(copy).not.toEqual(map);
            copy.makeImmutable();
            expect(copy).toEqual(map);
        });
    });
});
