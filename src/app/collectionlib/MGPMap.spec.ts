import { MGPMap, Comparable } from "./MGPMap";

class Key implements Comparable {

    constructor(private value: String) {}

    equals(o: any): boolean {
        return o.value === this.value;
    }
    toString(): String {
        return "";
    }
}
describe('MGPMap', () => {

    it('Null key should throw error', () => {
        const map: MGPMap<Key, String> = new MGPMap();
        expect(() => map.put(null, "")).toThrow();
    });
    it('Null value should throw error', () => {
        const map: MGPMap<Key, String> = new MGPMap();
        expect(() => map.put(new Key('oui'), null)).toThrow();
    });
    it('Double should not be allowed in MGPMap', () => {
        const map: MGPMap<Key, String> = new MGPMap();
        map.put(new Key('oui'), 'yes');
        expect(() => map.put(new Key('oui'), 'si')).toThrow();
    });
});