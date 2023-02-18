/* eslint-disable max-lines-per-function */
import { CoordXYZ } from '../CoordXYZ';

describe('CoordXYZ:', () => { // TODOTODO check that it is self tested

    it('should override equals correctly', () => {
        const coord: CoordXYZ = new CoordXYZ(0, 0, 0);
        const close1: CoordXYZ = new CoordXYZ(1, 0, 0);
        const close2: CoordXYZ = new CoordXYZ(0, 1, 0);
        const close3: CoordXYZ = new CoordXYZ(0, 0, 1);
        const twin: CoordXYZ = new CoordXYZ(0, 0, 0);
        expect(coord.equals(coord)).toBeTrue();
        expect(coord.equals(close1)).toBeFalse();
        expect(coord.equals(close2)).toBeFalse();
        expect(coord.equals(close3)).toBeFalse();
        expect(coord.equals(twin)).toBeTrue();
    });

    it('should compare Z correctly', () => {
        const coord: CoordXYZ = new CoordXYZ(0, 0, 0);
        const upperCoord: CoordXYZ = new CoordXYZ(0, 0, 1);
        expect(coord.isUpperThan(upperCoord)).toBeFalse();
    });
});
