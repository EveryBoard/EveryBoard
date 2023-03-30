/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { DiamMoveDrop, DiamMoveEncoder, DiamMoveShift } from '../DiamMove';
import { DiamPiece } from '../DiamPiece';

describe('DiamMove', () => {
    describe('drop', () => {
        it('should forbid a drop of an empty piece', () => {
            expect(() => new DiamMoveDrop(3, DiamPiece.EMPTY)).toThrowError('Cannot drop an empty piece');
        });
        it('should correctly define equality', () => {
            const move1: DiamMoveDrop = new DiamMoveDrop(3, DiamPiece.ZERO_FIRST);
            const move2: DiamMoveDrop = new DiamMoveDrop(3, DiamPiece.ZERO_SECOND);
            const move3: DiamMoveDrop = new DiamMoveDrop(1, DiamPiece.ZERO_FIRST);
            expect(move1.equals(move1)).toBeTrue();
            expect(move1.equals(move2)).toBeFalse();
            expect(move1.equals(move3)).toBeFalse();
        });
        it('should redefine toString', () => {
            const move: DiamMoveDrop = new DiamMoveDrop(3, DiamPiece.ZERO_FIRST);
            expect(move.toString()).toEqual('DiamMoveDrop(3, DiamPiece(PLAYER_ZERO, false))');
        });
    });
    describe('shift', () => {
        it('should compute the right targets', () => {
            const move1: DiamMoveShift = new DiamMoveShift(new Coord(4, 0), 'clockwise');
            expect(move1.getTarget()).toBe(5);
            const move2: DiamMoveShift = new DiamMoveShift(new Coord(7, 0), 'clockwise');
            expect(move2.getTarget()).toBe(0);
            const move3: DiamMoveShift = new DiamMoveShift(new Coord(0, 0), 'counterclockwise');
            expect(move3.getTarget()).toBe(7);
        });
        it('should correctly redefine equality', () => {
            const move1: DiamMoveShift = new DiamMoveShift(new Coord(0, 0), 'clockwise');
            const move2: DiamMoveShift = new DiamMoveShift(new Coord(0, 1), 'clockwise');
            const move3: DiamMoveShift = new DiamMoveShift(new Coord(0, 0), 'counterclockwise');
            const drop: DiamMoveDrop = new DiamMoveDrop(1, DiamPiece.ZERO_FIRST);
            expect(move1.equals(move1)).toBeTrue();
            expect(move1.equals(move2)).toBeFalse();
            expect(move1.equals(move3)).toBeFalse();
            expect(move1.equals(drop)).toBeFalse();
        });
        it('should redefine toString', () => {
            const move: DiamMoveShift = new DiamMoveShift(new Coord(0, 0), 'clockwise');
            expect(move.toString()).toEqual('DiamMoveShift((0, 0), clockwise)');
        });
    });
    it('should have a bijective encoder', () => {
        NumberEncoderTestUtils.expectToBeBijective(DiamMoveEncoder, new DiamMoveDrop(3, DiamPiece.ZERO_FIRST));
        NumberEncoderTestUtils.expectToBeBijective(DiamMoveEncoder, new DiamMoveShift(new Coord(3, 3), 'clockwise'));
        NumberEncoderTestUtils.expectToBeBijective(DiamMoveEncoder, new DiamMoveShift(new Coord(3, 3), 'counterclockwise'));
    });
});
