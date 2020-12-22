import {Coord} from './Coord';

describe('Coord', () => {
    it('should compare correctly, y first', () => {
        const smallCoord: Coord = new Coord(2, 1);
        const bigCoord: Coord = new Coord(1, 2);
        expect(smallCoord.compareTo(bigCoord)).toBe(-1);
    });
    it('should compare correctly obvious case', () => {
        const smallCoord: Coord = new Coord(0, 0);
        const bigCoord: Coord = new Coord(2, 2);
        expect(smallCoord.compareTo(bigCoord)).toBe(-1);
    });
});
