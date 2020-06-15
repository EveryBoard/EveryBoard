import { MGPMap } from "./MGPMap";
import { MGPOptional } from "../mgpoptional/MGPOptional";
import { MGPStr } from "../mgpstr/MGPStr";

describe('MGPMap', () => {

    it('Null key should throw error with', () => {
        const map: MGPMap<MGPStr, String> = new MGPMap();
        expect(() => map.set(null, "")).toThrow();
        expect(() => map.put(null, "")).toThrow();
        expect(() => map.get(null)).toThrow();
    });
    it('Null value should throw error', () => {
        const map: MGPMap<MGPStr, String> = new MGPMap();
        expect(() => map.set(new MGPStr('oui'), null)).toThrow();
        expect(() => map.put(new MGPStr('oui'), null)).toThrow();
    });
    it('Set should bug if key value was already present', () => {
        const map: MGPMap<MGPStr, String> = new MGPMap();
        map.set(new MGPStr('oui'), 'yes');
        expect(() => map.set(new MGPStr('oui'), 'si')).toThrow();
    });
    it('Put should replace value if key value was already present', () => {
        const map: MGPMap<MGPStr, String> = new MGPMap();
        map.put(new MGPStr('oui'), 'yes');
        expect(() => map.put(new MGPStr('oui'), 'DA')).not.toThrow();
        expect(map.get(new MGPStr('oui'))).toEqual(MGPOptional.of('DA'));
    });
    it('ListKey should work', () => {
        const map: MGPMap<MGPStr, Number> = new MGPMap();
        map.set(new MGPStr("first"), 1);
        map.set(new MGPStr("second"), 2);

        expect(map.listKeys()).toEqual([new MGPStr("first"), new MGPStr("second")]);
    });
    it('Replace should work', () => {
        const map: MGPMap<MGPStr, Number> = new MGPMap();
        map.set(new MGPStr("first"), 1);
        map.replace(new MGPStr("first"), 0);

        expect(map.get(new MGPStr("first"))).toEqual(MGPOptional.of(0));
    });
    it('Replace should throw when value not found', () => {
        const map: MGPMap<MGPStr, Number> = new MGPMap();
        map.set(new MGPStr("first"), 1);

        expect( () => map.replace(new MGPStr("firstZUUU"), 0)).toThrow();
    });
    it('Delete should delete element', () => {
        const map: MGPMap<MGPStr, Number> = new MGPMap();
        map.set(new MGPStr("first"), 0);
        map.set(new MGPStr("second"), 1);
        map.set(new MGPStr("third"), 2);
        map.delete(new MGPStr("first"));

        expect(map.get(new MGPStr("first"))).toEqual(MGPOptional.empty());
    });
});