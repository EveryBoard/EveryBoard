import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { SixMove } from '../SixMove';

describe('SixMove', () => {

    it('Should allow dropping', () => {
        const move: SixMove = SixMove.fromDrop(new Coord(0, 0));
        expect(move).toBeTruthy();
    });
    it('Should allow move without mentionned "keep"', () => {
        const move: SixMove = SixMove.fromDeplacement(new Coord(0, 0), new Coord(1, 1));
        expect(move).toBeTruthy();
    });
    it('Should throw when creating static deplacement', () => {
        const error: string = 'Deplacement cannot be static!';
        expect(() => SixMove.fromDeplacement(new Coord(0, 0), new Coord(0, 0))).toThrowError(error);
    });
    it('Should allow move with mentionned "keep"', () => {
        const move: SixMove = SixMove.fromCut(new Coord(0, 0), new Coord(2, 2), new Coord(1, 1));
        expect(move).toBeTruthy();
    });
    it('Should throw when creating deplacement keeping starting coord', () => {
        const error: string = 'Cannot keep starting coord, since it will always be empty after move!';
        expect(() => SixMove.fromCut(new Coord(0, 0), new Coord(1, 1), new Coord(0, 0)))
            .toThrowError(error);
    });
    describe('Overrides', () => {

        const drop: SixMove = SixMove.fromDrop(new Coord(5, 5));
        const deplacement: SixMove = SixMove.fromDeplacement(new Coord(5, 5), new Coord(7, 5));
        const cut: SixMove = SixMove.fromCut(new Coord(5, 5), new Coord(7, 5), new Coord(9, 9));
        it('should have functionnal equals', () => {
            const drop: SixMove = SixMove.fromDrop(new Coord(0, 0));
            const otherDrop: SixMove = SixMove.fromDrop(new Coord(1, 1));
            const deplacement: SixMove = SixMove.fromDeplacement(new Coord(1, 1), new Coord(0, 0));
            const cuttingDeplacement: SixMove =
                SixMove.fromCut(new Coord(1, 1), new Coord(0, 0), new Coord(2, 2));
            expect(drop.equals(otherDrop)).toBeFalse();
            expect(drop.equals(deplacement)).toBeFalse();
            expect(deplacement.equals(cuttingDeplacement)).toBeFalse();
        });
        it('Should forbid non object to decode', () => {
            expect(() => SixMove.encoder.decode(0.5)).toThrowError('Invalid encodedMove of type number!');
        });
        it('should stringify nicely', () => {
            expect(drop.toString()).toEqual('SixMove((5, 5))');
            expect(deplacement.toString()).toEqual('SixMove((5, 5) > (7, 5))');
            expect(cut.toString()).toEqual('SixMove((5, 5) > (7, 5), keep: (9, 9))');
        });
        it('SixMove.encoder should be correct', () => {
            const moves: SixMove[] = [drop, deplacement, cut];
            for (const move of moves) {
                EncoderTestUtils.expectToBeCorrect(SixMove.encoder, move);
            }
        });
    });
});
