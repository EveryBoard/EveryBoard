import { Coord } from 'src/app/jscaip/Coord';
import { DiamMoveDrop, DiamMoveShift } from '../DiamMove';
import { DiamPiece } from '../DiamPiece';

fdescribe('DiamMove', () => {
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
            expect(move.toString()).toEqual('DiamMoveDrop(3, DiamPiece(Player 0, false))');
        });
    });
    describe('shift', () => {
        it('should compute the right targets', () => {
            const move1: DiamMoveShift = new DiamMoveShift(new Coord(4, 0), 'right');
            expect(move1.getTarget()).toBe(5);
            const move2: DiamMoveShift = new DiamMoveShift(new Coord(7, 0), 'right');
            expect(move2.getTarget()).toBe(0);
            const move3: DiamMoveShift = new DiamMoveShift(new Coord(0, 0), 'left');
            expect(move3.getTarget()).toBe(7);
        });
        it('should correctly redefine equality', () => {
            const move1: DiamMoveShift = new DiamMoveShift(new Coord(0, 0), 'right');
            const move2: DiamMoveShift = new DiamMoveShift(new Coord(0, 1), 'right');
            const move3: DiamMoveShift = new DiamMoveShift(new Coord(0, 0), 'left');
            expect(move1.equals(move1)).toBeTrue();
            expect(move1.equals(move2)).toBeFalse();
            expect(move1.equals(move3)).toBeFalse();
        });
        it('should redefine toString', () => {
            const move: DiamMoveShift = new DiamMoveShift(new Coord(0, 0), 'right');
            expect(move.toString()).toEqual('DiamMoveShift((0, 0), right)');
        });
    });
});
