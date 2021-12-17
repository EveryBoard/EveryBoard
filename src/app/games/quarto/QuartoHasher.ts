import { NumberTable } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { QuartoPiece } from './QuartoPiece';
import { Utils } from 'src/app/utils/utils';

export interface CoordDir {
    readonly coord: Coord,
    readonly dir: Orthogonal
}
export interface QuartoHashInfo {
    readonly coordDir: CoordDir,
    readonly firstPiece: MGPOptional<QuartoPiece>
}
export class QuartoHasher {
    public static readonly coordDirs: CoordDir[] = [
        { coord: new Coord(0, 0), dir: Orthogonal.RIGHT },
        { coord: new Coord(0, 0), dir: Orthogonal.DOWN },

        { coord: new Coord(3, 0), dir: Orthogonal.LEFT },
        { coord: new Coord(3, 0), dir: Orthogonal.DOWN },

        { coord: new Coord(3, 3), dir: Orthogonal.LEFT },
        { coord: new Coord(3, 3), dir: Orthogonal.UP },

        { coord: new Coord(0, 3), dir: Orthogonal.RIGHT },
        { coord: new Coord(0, 3), dir: Orthogonal.UP },
    ];
    public static filter(board: NumberTable): QuartoHashInfo {
        let quartoHasherInfos: QuartoHashInfo[] = QuartoHasher.coordDirs.map((coordDir: CoordDir) => {
            return {
                coordDir,
                firstPiece: MGPOptional.empty(),
            };
        });
        let level: number = 0;
        while (level < 15) {
            quartoHasherInfos = QuartoHasher.filterSubLevel(board, level, quartoHasherInfos);
            level++;
        }
        return quartoHasherInfos[0];
    }
    public static filterSubLevel(board: NumberTable,
                                 depth: number,
                                 quartoHashInfos: QuartoHashInfo[],
    ): QuartoHashInfo[]
    {
        let remainingHashInfos: QuartoHashInfo[] = [];
        let min: number = QuartoPiece.NONE.value;
        for (const quartoHashInfo of quartoHashInfos) {
            let firstPiece: MGPOptional<QuartoPiece> = quartoHashInfo.firstPiece;
            const coordDir: CoordDir = quartoHashInfo.coordDir;
            const coord: Coord = QuartoHasher.get(coordDir, depth);
            let piece: QuartoPiece = QuartoPiece.fromInt(board[coord.y][coord.x]);
            if (piece !== QuartoPiece.NONE && firstPiece.isAbsent()) {
                firstPiece = MGPOptional.of(piece);
            }
            if (firstPiece.isPresent()) {
                piece = QuartoHasher.matchPieceTo(piece, firstPiece.get());
            }

            if (piece.value === min) {
                remainingHashInfos.push({ coordDir, firstPiece });
            } else if (piece.value < min) {
                remainingHashInfos = [{ coordDir, firstPiece }];
                min = piece.value;
            }
        }
        if (remainingHashInfos.length === 0) {
            return quartoHashInfos;
        } else {
            return remainingHashInfos;
        }
    }
    public static get(coordDir: CoordDir, n: number): Coord {
        let coord: Coord = coordDir.coord.getCopy();
        const firstDir: Orthogonal = coordDir.dir;
        const secondDir: Orthogonal = Utils.getNonNullable(QuartoHasher.coordDirs.find((coordDir: CoordDir) =>
            coordDir.coord.equals(coord) &&
            coordDir.dir.equals(firstDir) === false)).dir;
        while (n >= 4) {
            n -= 4;
            coord = coord.getNext(secondDir, 1);
        }
        coord = coord.getNext(firstDir, n);
        return coord;
    }
    public static matchPieceTo(piece: QuartoPiece, mapper: QuartoPiece): QuartoPiece {
        if (piece === QuartoPiece.NONE) {
            return QuartoPiece.NONE;
        } else {
            let result: number = 0;
            let n: number = 1;
            for (let i: number = 0; i < 4; i++) {
                if ((piece.value & n) !== (mapper.value & n)) {
                    result += n;
                }
                n *= 2;
            }
            return QuartoPiece.fromInt(result);
        }
    }
}
