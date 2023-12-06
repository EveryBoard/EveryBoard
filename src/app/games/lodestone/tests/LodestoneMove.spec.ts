import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from '@everyboard/lib';
import { LodestoneMove } from '../LodestoneMove';

describe('LodestoneMove', () => {
    describe('equals', () => {
        const someMove: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', 'diagonal');
        it('should detect different moves', () => {
            const moveWithDifferentCoord: LodestoneMove = new LodestoneMove(new Coord(1, 0), 'push', 'diagonal');
            const moveWithDifferentDirection: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'pull', 'diagonal');
            const moveWithDifferentAngle: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', 'orthogonal');
            const moveWithDifferentTopCaptures: LodestoneMove =
                new LodestoneMove(new Coord(0, 0), 'push', 'diagonal', { top: 1, bottom: 0, left: 0, right: 0 });
            const moveWithDifferentBottomCaptures: LodestoneMove =
                new LodestoneMove(new Coord(0, 0), 'push', 'diagonal', { top: 0, bottom: 1, left: 0, right: 0 });
            const moveWithDifferentLeftCaptures: LodestoneMove =
                new LodestoneMove(new Coord(0, 0), 'push', 'diagonal', { top: 0, bottom: 0, left: 1, right: 0 });
            const moveWithDifferentRightCaptures: LodestoneMove =
                new LodestoneMove(new Coord(0, 0), 'push', 'diagonal', { top: 0, bottom: 0, left: 0, right: 1 });

            expect(someMove.equals(moveWithDifferentCoord)).toBeFalse();
            expect(someMove.equals(moveWithDifferentDirection)).toBeFalse();
            expect(someMove.equals(moveWithDifferentAngle)).toBeFalse();
            expect(someMove.equals(moveWithDifferentTopCaptures)).toBeFalse();
            expect(someMove.equals(moveWithDifferentBottomCaptures)).toBeFalse();
            expect(someMove.equals(moveWithDifferentLeftCaptures)).toBeFalse();
            expect(someMove.equals(moveWithDifferentRightCaptures)).toBeFalse();
        });
        it('should detect equal moves', () => {
            expect(someMove.equals(someMove)).toBeTrue();
            const equalMove: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', 'diagonal');
            expect(someMove.equals(equalMove)).toBeTrue();
        });
    });
    it('should redefine toString', () => {
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', 'diagonal');
        expect(move.toString()).toEqual('LodestoneMove((0, 0), push, diagonal, { top: 0, bottom: 0, left: 0, right: 0 })');
    });
    it('should have a bijective encoder', () => {
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', 'diagonal', { top: 1, bottom: 0, left: 0, right: 0 });
        EncoderTestUtils.expectToBeBijective(LodestoneMove.encoder, move);
    });
});
