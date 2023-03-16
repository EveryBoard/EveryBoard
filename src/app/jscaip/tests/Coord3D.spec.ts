/* eslint-disable max-lines-per-function */
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { JSONValue } from 'src/app/utils/utils';
import { Coord3D } from '../Coord3D';

describe('Coord3D:', () => {

    it('should encode optional and decode should be symetrical', () => {
        const initialValues: MGPOptional<Coord3D>[] = [
            MGPOptional.empty(),
            MGPOptional.of(new Coord3D(0, 0, 0)),
        ];
        const encodedValues: JSONValue[] = initialValues.map(Coord3D.optionalEncoder.encode);
        const decodedValues: MGPOptional<Coord3D>[] = encodedValues.map(Coord3D.optionalEncoder.decode);
        const expectedValues: JSONValue[] = [
            null,
            { x: 0, y: 0, z: 0 },
        ];
        expect(encodedValues).toEqual(expectedValues);
        expect(decodedValues).toEqual(initialValues);
    });

    it('should override equals correctly', () => {
        const coord: Coord3D = new Coord3D(0, 0, 0);
        const close1: Coord3D = new Coord3D(1, 0, 0);
        const close2: Coord3D = new Coord3D(0, 1, 0);
        const close3: Coord3D = new Coord3D(0, 0, 1);
        const twin: Coord3D = new Coord3D(0, 0, 0);
        expect(coord.equals(coord)).toBeTrue();
        expect(coord.equals(close1)).toBeFalse();
        expect(coord.equals(close2)).toBeFalse();
        expect(coord.equals(close3)).toBeFalse();
        expect(coord.equals(twin)).toBeTrue();
    });

    it('should implement toString and toShortString', () => {
        expect(Coord3D.from(0, 0, 0).toString()).toBe('Coord3D(0, 0, 0)');
        expect(Coord3D.from(0, 0, 0).toShortString()).toBe('(0, 0, 0)');
    });

    it('should compare Z correctly', () => {
        const coord: Coord3D = new Coord3D(0, 0, 0);
        const upperCoord: Coord3D = new Coord3D(0, 0, 1);
        expect(coord.isUpperThan(upperCoord)).toBeFalse();
    });
});
