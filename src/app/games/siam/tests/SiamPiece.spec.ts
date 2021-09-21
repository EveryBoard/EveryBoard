import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { SiamPiece } from '../SiamPiece';

describe('SiamPiece:', () => {
    it('should give string version of each pieces', () => {
        const values: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const pieces: SiamPiece[] = values.map((value: number) => SiamPiece.decode(value));
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
    it('Should throw when static method are called inadequately', () => {
        expect(() => SiamPiece.of(Orthogonal.UP, null)).toThrowError('Player must be set.');
        expect(() => SiamPiece.of(null, Player.ONE)).toThrowError('Orientation must be set.');
        expect(() => SiamPiece.of(Orthogonal.UP, Player.NONE)).toThrowError(`Player None don't have any pieces.`);
        expect(() => SiamPiece.decode(10)).toThrowError('Unknown value for SiamPiece(10).');
        expect(() => SiamPiece.belongTo(1, null)).toThrowError('Player must be set (even if Player.NONE).');
        expect(() => SiamPiece.getOwner(10)).toThrowError('Player.NONE do not own piece.');
        expect(() => SiamPiece.getDirection(null)).toThrowError('Piece null has no direction.');
    });
    it('Should consider moutains as belonging to no player and now which one do', () => {
        expect(SiamPiece.belongTo(SiamPiece.MOUNTAIN.value, Player.NONE)).toBeFalse();
        expect(SiamPiece.belongTo(SiamPiece.BLACK_DOWN.value, Player.ZERO)).toBeFalse();
        expect(SiamPiece.belongTo(SiamPiece.WHITE_RIGHT.value, Player.ONE)).toBeFalse();
    });
});
