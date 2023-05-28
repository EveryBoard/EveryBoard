/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { SixMove } from '../SixMove';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';

describe('SixMove', () => {

    it('should allow dropping', () => {
        const move: SixMove = SixMove.ofDrop(new Coord(0, 0));
        expect(move).toBeTruthy();
    });
    it('should allow move without mentionned "keep"', () => {
        const move: SixMove = SixMove.ofMovement(new Coord(0, 0), new Coord(1, 1));
        expect(move).toBeTruthy();
    });
    it('should throw when creating static movement', () => {
        function creatingStaticMovement(): void {
            SixMove.ofMovement(new Coord(0, 0), new Coord(0, 0));
        }
        RulesUtils.expectToThrowAndLog(creatingStaticMovement, 'Deplacement cannot be static!');
    });
    it('should allow move with mentionned "keep"', () => {
        const move: SixMove = SixMove.ofCut(new Coord(0, 0), new Coord(2, 2), new Coord(1, 1));
        expect(move).toBeTruthy();
    });
    it('should throw when creating movement keeping starting coord', () => {
        function creatingMovementKeepingStartingCoord(): void {
            SixMove.ofCut(new Coord(0, 0), new Coord(1, 1), new Coord(0, 0));
        }
        RulesUtils.expectToThrowAndLog(creatingMovementKeepingStartingCoord,
                                       'Cannot keep starting coord, since it will always be empty after move!');
    });
    describe('Overrides', () => {

        const drop: SixMove = SixMove.ofDrop(new Coord(5, 5));
        const movement: SixMove = SixMove.ofMovement(new Coord(5, 5), new Coord(7, 5));
        const cut: SixMove = SixMove.ofCut(new Coord(5, 5), new Coord(7, 5), new Coord(9, 9));
        it('should have functionnal equals', () => {
            const drop: SixMove = SixMove.ofDrop(new Coord(0, 0));
            const otherDrop: SixMove = SixMove.ofDrop(new Coord(1, 1));
            const movement: SixMove = SixMove.ofMovement(new Coord(1, 1), new Coord(0, 0));
            const cuttingDeplacement: SixMove =
                SixMove.ofCut(new Coord(1, 1), new Coord(0, 0), new Coord(2, 2));
            expect(drop.equals(otherDrop)).toBeFalse();
            expect(drop.equals(movement)).toBeFalse();
            expect(movement.equals(cuttingDeplacement)).toBeFalse();
        });
        it('should stringify nicely', () => {
            expect(drop.toString()).toEqual('SixMove((5, 5))');
            expect(movement.toString()).toEqual('SixMove((5, 5) > (7, 5))');
            expect(cut.toString()).toEqual('SixMove((5, 5) > (7, 5), keep: (9, 9))');
        });
        it('should have a bijective encoder', () => {
            const moves: SixMove[] = [drop, movement, cut];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(SixMove.encoder, move);
            }
        });
    });
});
