import { NumberTable } from 'src/app/collectionlib/arrayutils/ArrayUtils';
import { MGPOptional } from 'src/app/collectionlib/mgpoptional/MGPOptional';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Orthogonal } from 'src/app/jscaip/DIRECTION';
import { QuartoEnum } from '../QuartoEnum';
import { CoordDir, QuartoHasher, QuartoHashInfo } from './QuartoHasher';

xdescribe('QuartoHasher', () => {
    const _: number = QuartoEnum.UNOCCUPIED;
    const A: number = QuartoEnum.AAAA;
    const B: number = QuartoEnum.AAAB;
    const C: number = QuartoEnum.AABA;
    const D: number = QuartoEnum.AABB;

    const E: number = QuartoEnum.ABAA;
    const F: number = QuartoEnum.ABAB;
    const G: number = QuartoEnum.ABBA;
    const H: number = QuartoEnum.ABBB;

    const I: number = QuartoEnum.BAAA;
    const J: number = QuartoEnum.BAAB;
    const K: number = QuartoEnum.BABA;
    const L: number = QuartoEnum.BABB;

    const M: number = QuartoEnum.BBAA;
    const N: number = QuartoEnum.BBAB;
    const O: number = QuartoEnum.BBBA;
    const P: number = QuartoEnum.BBBB;

    it('should get the correct Coord', () => {
        const coordDir: CoordDir = { coord: new Coord(3, 3), dir: Orthogonal.UP };
        expect(QuartoHasher.get(coordDir, 3)).toEqual(new Coord(3, 0));
        expect(QuartoHasher.get(coordDir, 4)).toEqual(new Coord(2, 3));
    });
    it('should match piece correctly', () => {
        expect(QuartoHasher.matchPieceTo(QuartoEnum.BBBB, QuartoEnum.BBBB)).toBe(QuartoEnum.AAAA);
        expect(QuartoHasher.matchPieceTo(QuartoEnum.BBAA, QuartoEnum.BBBB)).toBe(QuartoEnum.AABB);
        expect(QuartoHasher.matchPieceTo(QuartoEnum.BBAA, QuartoEnum.AABB)).toBe(QuartoEnum.BBBB);
    });
    it('should filter correctly with only one corner occupied', () => {
        const board: NumberTable = [
            [_, _, _, A],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
        ];
        const remainingCoordDirs: QuartoHashInfo = QuartoHasher.filterSubLevel(board, 0, MGPOptional.empty(), QuartoHasher.coordDirs);
        expect(remainingCoordDirs).toEqual({
            coordDirs: [
                { coord: new Coord(3, 0), dir: Orthogonal.LEFT },
                { coord: new Coord(3, 0), dir: Orthogonal.DOWN },
            ],
            firstPiece: MGPOptional.of(A),
        });
    });
    it('should filter correctly with only one corner occupied and one adjacent ridge', () => {
        const board: NumberTable = [
            [_, _, _, P],
            [_, _, _, B],
            [_, _, _, _],
            [_, _, _, _],
        ];
        const remainingCoordDirs: QuartoHashInfo = QuartoHasher.filterSubLevel(board, 1, MGPOptional.empty(), QuartoHasher.coordDirs);
        expect(remainingCoordDirs).toEqual({
            coordDirs: [
                { coord: new Coord(3, 0), dir: Orthogonal.LEFT },
                { coord: new Coord(3, 0), dir: Orthogonal.DOWN },
            ],
            firstPiece: MGPOptional.of(A),
        });
    });
});
