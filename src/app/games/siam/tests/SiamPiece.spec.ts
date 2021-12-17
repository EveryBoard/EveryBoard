import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { SiamPiece, SiamPieceValue } from '../SiamPiece';

describe('SiamPiece:', () => {
    it('Should throw when static method are called inadequately', () => {
        expect(() => SiamPiece.of(Orthogonal.UP, Player.NONE)).toThrowError(`Player None does not have any pieces.`);
    });
    it('should give string version of each pieces', () => {
        const values: SiamPieceValue[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const pieces: SiamPiece[] = values.map((value: SiamPieceValue) => SiamPiece.decode(value));
        const names: string[] = pieces.map((piece: SiamPiece) => piece.toString());
        const expectedPieces: SiamPiece[] = [
            SiamPiece.EMPTY,
            SiamPiece.WHITE_UP,
            SiamPiece.WHITE_RIGHT,
            SiamPiece.WHITE_DOWN,
            SiamPiece.WHITE_LEFT,
            SiamPiece.BLACK_UP,
            SiamPiece.BLACK_RIGHT,
            SiamPiece.BLACK_DOWN,
            SiamPiece.BLACK_LEFT,
            SiamPiece.MOUNTAIN,
        ];
        const expectedNames: string[] = [
            'EMPTY',
            'WHITE_UP',
            'WHITE_RIGHT',
            'WHITE_DOWN',
            'WHITE_LEFT',
            'BLACK_UP',
            'BLACK_RIGHT',
            'BLACK_DOWN',
            'BLACK_LEFT',
            'MOUNTAIN',
        ];
        expect(names).toEqual(expectedNames);
        expect(pieces).toEqual(expectedPieces);
    });
    it('Should consider moutains as belonging to no player and know which one do', () => {
        expect(SiamPiece.MOUNTAIN.belongTo(Player.NONE)).toBeFalse();
        expect(SiamPiece.BLACK_DOWN.belongTo(Player.ZERO)).toBeFalse();
        expect(SiamPiece.WHITE_RIGHT.belongTo(Player.ONE)).toBeFalse();
    });
});
