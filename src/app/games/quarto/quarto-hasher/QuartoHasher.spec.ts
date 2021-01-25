import { NumberTable } from 'src/app/collectionlib/arrayutils/ArrayUtils';
import { MGPOptional } from 'src/app/collectionlib/mgpoptional/MGPOptional';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Orthogonal } from 'src/app/jscaip/DIRECTION';
import { QuartoPiece } from '../QuartoPiece';
import { CoordDir, QuartoHasher, QuartoHashInfo } from './QuartoHasher';

xdescribe('QuartoHasher', () => {
    const NULL: number = QuartoPiece.NONE.value;
    const AAAA: number = QuartoPiece.AAAA.value;
    const AAAB: number = QuartoPiece.AAAB.value;
    const BBBB: number = QuartoPiece.BBBB.value;

    it('should get the correct Coord', () => {
        const coordDir: CoordDir = { coord: new Coord(3, 3), dir: Orthogonal.UP };
        expect(QuartoHasher.get(coordDir, 3)).toEqual(new Coord(3, 0));
        expect(QuartoHasher.get(coordDir, 4)).toEqual(new Coord(2, 3));
    });
    it('should match piece correctly', () => {
        expect(QuartoHasher.matchPieceTo(QuartoPiece.BBBB, QuartoPiece.BBBB)).toBe(QuartoPiece.AAAA);
        expect(QuartoHasher.matchPieceTo(QuartoPiece.BBAA, QuartoPiece.BBBB)).toBe(QuartoPiece.AABB);
        expect(QuartoHasher.matchPieceTo(QuartoPiece.BBAA, QuartoPiece.AABB)).toBe(QuartoPiece.BBBB);
    });
    it('should filter correctly with only one corner occupied', () => {
        const board: NumberTable = [
            [NULL, NULL, NULL, AAAA],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
        ];
        const remainingCoordDirs: QuartoHashInfo = QuartoHasher.filterSubLevel(board, 0, MGPOptional.empty(), QuartoHasher.coordDirs);
        expect(remainingCoordDirs).toEqual({
            coordDirs: [
                { coord: new Coord(3, 0), dir: Orthogonal.LEFT },
                { coord: new Coord(3, 0), dir: Orthogonal.DOWN },
            ],
            firstPiece: MGPOptional.of(AAAA),
        });
    });
    it('should filter correctly with only one corner occupied and one adjacent ridge', () => {
        const board: NumberTable = [
            [NULL, NULL, NULL, BBBB],
            [NULL, NULL, NULL, AAAB],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
        ];
        const remainingCoordDirs: QuartoHashInfo = QuartoHasher.filterSubLevel(board, 1, MGPOptional.empty(), QuartoHasher.coordDirs);
        expect(remainingCoordDirs).toEqual({
            coordDirs: [
                { coord: new Coord(3, 0), dir: Orthogonal.LEFT },
                { coord: new Coord(3, 0), dir: Orthogonal.DOWN },
            ],
            firstPiece: MGPOptional.of(AAAA),
        });
    });
});
