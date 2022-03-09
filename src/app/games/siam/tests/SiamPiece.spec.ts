/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { SiamPiece, SiamPieceValue } from '../SiamPiece';

describe('SiamPiece:', () => {
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
    it('Should consider moutains as belonging to no player and pieces to their respective players', () => {
        expect(SiamPiece.MOUNTAIN.belongTo(Player.ONE)).toBeFalse();
        expect(SiamPiece.MOUNTAIN.belongTo(Player.ZERO)).toBeFalse();
        expect(SiamPiece.BLACK_DOWN.belongTo(Player.ZERO)).toBeFalse();
        expect(SiamPiece.BLACK_DOWN.belongTo(Player.ONE)).toBeTrue();
        expect(SiamPiece.WHITE_RIGHT.belongTo(Player.ZERO)).toBeTrue();
        expect(SiamPiece.WHITE_RIGHT.belongTo(Player.ONE)).toBeFalse();
    });
    it('should give the owner of each piece with getOwner', () => {
        expect(SiamPiece.MOUNTAIN.getOwner()).toBe(PlayerOrNone.NONE);
        expect(SiamPiece.BLACK_DOWN.getOwner()).toBe(Player.ONE);
        expect(SiamPiece.WHITE_RIGHT.getOwner()).toBe(Player.ZERO);
    });
});
