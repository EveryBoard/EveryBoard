/* eslint-disable max-lines-per-function */
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { JSONValue } from 'src/app/utils/utils';
import { Coord3D } from '../Coord3D';

describe('Coord3D:', () => {

    describe('encoder', () => {
        it('should encode empty optional to null', () => {
            // Given a empty optional
            const optionalCoord: MGPOptional<Coord3D> = MGPOptional.empty();

            // When encoding it
            const encoded: JSONValue = Coord3D.optionalEncoder.encode(optionalCoord);

            // Then result should be null
            expect(encoded).toEqual(null);
        });
        it('should decode null as empty optional', () => {
            // Given the null value
            const encoded: JSONValue = null;

            // When decoding it
            const decoded: MGPOptional<Coord3D> = Coord3D.optionalEncoder.decode(encoded);

            // Then the value should be empty option
            expect(decoded).toEqual(MGPOptional.empty());
        });
        it('should JSONify for encoding', () => {
            // Given a optional pylos coord
            const optionalCoord: MGPOptional<Coord3D> = MGPOptional.of(new Coord3D(1, 2, 3));

            // When encoding it
            const encoded: JSONValue = Coord3D.optionalEncoder.encode(optionalCoord);

            // Then result should be null
            expect(encoded).toEqual({ x: 1, y: 2, z: 3 });
        });
        it('should decode json smartly', () => {
            // Given the encoded json value
            const encoded: JSONValue = { x: 1, y: 2, z: 3 };

            // When decoding it
            const decoded: MGPOptional<Coord3D> = Coord3D.optionalEncoder.decode(encoded);

            // Then the value should be empty option
            expect(decoded).toEqual(MGPOptional.of(new Coord3D(1, 2, 3)));
        });
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
        expect(coord.isHigherThan(upperCoord)).toBeFalse();
    });
});
