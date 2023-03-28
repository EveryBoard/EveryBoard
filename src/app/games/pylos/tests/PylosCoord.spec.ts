/* eslint-disable max-lines-per-function */
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { PylosCoord } from '../PylosCoord';
import { JSONValue } from 'src/app/utils/utils';

describe('PylosCoord:', () => {

    describe('encoder', () => {
        it('should encode empty optional to null', () => {
            // Given a empty optional
            const optionalCoord: MGPOptional<PylosCoord> = MGPOptional.empty();

            // When encoding it
            const encoded: JSONValue = PylosCoord.optionalEncoder.encode(optionalCoord);

            // Then result should be null
            expect(encoded).toEqual(null);
        });
        it('should decode null as empty optional', () => {
            // Given the null value
            const encoded: JSONValue = null;

            // When decoding it
            const decoded: MGPOptional<PylosCoord> = PylosCoord.optionalEncoder.decode(encoded);

            // Then the value should be empty option
            expect(decoded).toEqual(MGPOptional.empty());
        });
        it('should JSONify for encoding', () => {
            // Given a optional pylos coord
            const optionalCoord: MGPOptional<PylosCoord> = MGPOptional.of(new PylosCoord(2, 1, 0));

            // When encoding it
            const encoded: JSONValue = PylosCoord.optionalEncoder.encode(optionalCoord);

            // Then result should be null
            expect(encoded).toEqual({ x: 2, y: 1, z: 0 });
        });
        it('should decode json smartly', () => {
            // Given the encoded json value
            const encoded: JSONValue = { x: 2, y: 1, z: 0 };

            // When decoding it
            const decoded: MGPOptional<PylosCoord> = PylosCoord.optionalEncoder.decode(encoded);

            // Then the value should be empty option
            expect(decoded).toEqual(MGPOptional.of(new PylosCoord(2, 1, 0)));
        });
    });

    it('should forbid invalid coord creation', () => {
        expect(() => new PylosCoord(-1, 0, 0)).toThrowError('PylosCoord: Invalid X: -1.');
        expect(() => new PylosCoord(0, -1, 0)).toThrowError('PylosCoord: Invalid Y: -1.');
        expect(() => new PylosCoord(0, 0, -1)).toThrowError('PylosCoord: Invalid Z: -1.');
        expect(() => new PylosCoord(3, 3, 3)).toThrowError('PylosCoord(3, 3, 3) is not in range.');
    });

    it('should override equals correctly', () => {
        const coord: PylosCoord = new PylosCoord(0, 0, 0);
        const closeOnX: PylosCoord = new PylosCoord(1, 0, 0);
        const closeOnY: PylosCoord = new PylosCoord(0, 1, 0);
        const closeOnZ: PylosCoord = new PylosCoord(0, 0, 1);
        const twin: PylosCoord = new PylosCoord(0, 0, 0);
        expect(coord.equals(coord)).toBeTrue();
        expect(coord.equals(closeOnX)).toBeFalse();
        expect(coord.equals(closeOnY)).toBeFalse();
        expect(coord.equals(closeOnZ)).toBeFalse();
        expect(coord.equals(twin)).toBeTrue();
    });

    it('should compare Z correctly', () => {
        const coord: PylosCoord = new PylosCoord(0, 0, 0);
        const upperCoord: PylosCoord = new PylosCoord(0, 0, 1);
        expect(coord.isHigherThan(upperCoord)).toBeFalse();
    });

    it('should give list of lower pieces, except for floor coord', () => {
        const upLeft: PylosCoord = new PylosCoord(0, 0, 0);
        const upRight: PylosCoord = new PylosCoord(1, 0, 0);
        const downLeft: PylosCoord = new PylosCoord(0, 1, 0);
        const downRight: PylosCoord = new PylosCoord(1, 1, 0);
        const expectedLowerPieces: PylosCoord[] = [upLeft, upRight, downLeft, downRight];
        const piece: PylosCoord = new PylosCoord(0, 0, 1);
        const lowerPieces: PylosCoord[] = piece.getLowerPieces();
        expect(() => upLeft.getLowerPieces()).toThrowError(`PylosCoord: floor pieces don't have lower pieces.`);
        expect(lowerPieces).toEqual(expectedLowerPieces);
    });

    it('should give list of higher pieces, except out of range ones, and expect for top pieces', () => {
        const topPiece: PylosCoord = new PylosCoord(0, 0, 3);
        const upLeft: PylosCoord = new PylosCoord(0, 0, 1);
        const upRight: PylosCoord = new PylosCoord(1, 0, 1);
        const downLeft: PylosCoord = new PylosCoord(0, 1, 1);
        const downRight: PylosCoord = new PylosCoord(1, 1, 1);
        const expectedLowerPieces: PylosCoord[] = [upLeft, upRight, downLeft, downRight];
        const piece: PylosCoord = new PylosCoord(1, 1, 0);
        const lowerPieces: PylosCoord[] = piece.getHigherCoords();
        expect(() => topPiece.getHigherCoords()).toThrowError(`Top piece don't have lower pieces.`);
        expect(lowerPieces).toEqual(expectedLowerPieces);
    });

    it('should give optional next piece in direction', () => {
        const piece: PylosCoord = new PylosCoord(0, 0, 0);
        const right: PylosCoord = new PylosCoord(1, 0, 0);
        expect(piece.getNextValid(Orthogonal.LEFT)).toEqual(MGPOptional.empty());
        expect(piece.getNextValid(Orthogonal.RIGHT)).toEqual(MGPOptional.of(right));
    });
});
