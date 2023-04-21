/* eslint-disable max-lines-per-function */
import { DvonnMove } from '../DvonnMove';
import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';

describe('DvonnMove', () => {

    it('should toString in a readable way', () => {
        expect((DvonnMove.of(new Coord(3, 2), new Coord(3, 3))).toString()).toEqual('DvonnMove((3, 2)->(3, 3))');
        expect(DvonnMove.PASS.toString()).toEqual('DvonnMove.PASS');
    });
    it('should encode and decode coord to coord moves bijectively', () => {
        const move: DvonnMove = DvonnMove.of(new Coord(3, 2), new Coord(3, 3));
        EncoderTestUtils.expectToBeBijective(DvonnMove.encoder, move);
    });
    it('should encode and decode PASS bijectively', () => {
        EncoderTestUtils.expectToBeBijective(DvonnMove.encoder, DvonnMove.PASS);
    });
    it('should force move to start and end inside the board', () => {
        expect(() => DvonnMove.of(new Coord(-1, 2), new Coord(0, 2))).toThrowError();
        expect(() => DvonnMove.of(new Coord(0, 2), new Coord(-1, 2))).toThrowError();
        expect(() => DvonnMove.of(new Coord(10, 2), new Coord(11, 2))).toThrowError();
        expect(() => DvonnMove.of(new Coord(10, 5), new Coord(10, 3))).toThrowError();
    });
    it('should force moves to be in a straight line', () => {
        expect(() => {
            DvonnMove.of(new Coord(2, 0), new Coord(4, 0));
            DvonnMove.of(new Coord(2, 0), new Coord(2, 3));
            DvonnMove.of(new Coord(2, 0), new Coord(1, 1));
            DvonnMove.of(new Coord(5, 2), new Coord(4, 2));
            DvonnMove.of(new Coord(5, 2), new Coord(5, 1));
            DvonnMove.of(new Coord(5, 2), new Coord(6, 1));
        }).not.toThrowError();
        expect(() => DvonnMove.of(new Coord(2, 0), new Coord(3, 2))).toThrowError();
    });
    it('should correctly compute move lengths', () => {
        expect(DvonnMove.of(new Coord(2, 0), new Coord(4, 0)).length()).toEqual(2);
        expect(DvonnMove.of(new Coord(2, 0), new Coord(2, 3)).length()).toEqual(3);
        expect(DvonnMove.of(new Coord(2, 0), new Coord(1, 1)).length()).toEqual(1);
        expect(DvonnMove.of(new Coord(5, 2), new Coord(3, 2)).length()).toEqual(2);
        expect(DvonnMove.of(new Coord(5, 2), new Coord(5, 0)).length()).toEqual(2);
        expect(DvonnMove.of(new Coord(5, 2), new Coord(6, 1)).length()).toEqual(1);
    });
    it('should override equals correctly', () => {
        const move: DvonnMove = DvonnMove.of(new Coord(2, 2), new Coord(2, 3));
        const sameMove: DvonnMove = DvonnMove.of(new Coord(2, 2), new Coord(2, 3));
        const neighbor: DvonnMove = DvonnMove.of(new Coord(3, 3), new Coord(2, 3));
        const stranger: DvonnMove = DvonnMove.of(new Coord(5, 2), new Coord(6, 2));
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(sameMove)).toBeTrue();
        expect(move.equals(neighbor)).toBeFalse();
        expect(move.equals(stranger)).toBeFalse();
    });
    it('should construct (-1, -1) -> (-2, -2) as PASS', () => {
        expect(DvonnMove.of(new Coord(-1, -1), new Coord(-2, -2))).toBe(DvonnMove.PASS);
    });
});
