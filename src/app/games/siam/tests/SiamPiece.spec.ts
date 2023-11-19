/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { SiamPiece, SiamPieceValue } from '../SiamPiece';

fdescribe('SiamPiece', () => {

    it('should give string version of each pieces', () => {
        const values: SiamPieceValue[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const pieces: SiamPiece[] = values.map(SiamPiece.decode);
        const names: string[] = pieces.map((piece: SiamPiece) => piece.toString());
        const expectedPieces: SiamPiece[] = [
            SiamPiece.EMPTY,
            SiamPiece.LIGHT_UP,
            SiamPiece.LIGHT_RIGHT,
            SiamPiece.LIGHT_DOWN,
            SiamPiece.LIGHT_LEFT,
            SiamPiece.DARK_UP,
            SiamPiece.DARK_RIGHT,
            SiamPiece.DARK_DOWN,
            SiamPiece.DARK_LEFT,
            SiamPiece.MOUNTAIN,
        ];
        const expectedNames: string[] = [
            'EMPTY',
            'LIGHT_UP',
            'LIGHT_RIGHT',
            'LIGHT_DOWN',
            'LIGHT_LEFT',
            'DARK_UP',
            'DARK_RIGHT',
            'DARK_DOWN',
            'DARK_LEFT',
            'MOUNTAIN',
        ];
        expect(names).toEqual(expectedNames);
        expect(pieces).toEqual(expectedPieces);
    });

    it('should consider moutains as belonging to no player and pieces to their respective players', () => {
        expect(SiamPiece.MOUNTAIN.belongTo(Player.ONE)).toBeFalse();
        expect(SiamPiece.MOUNTAIN.belongTo(Player.ZERO)).toBeFalse();
        expect(SiamPiece.DARK_DOWN.belongTo(Player.ZERO)).toBeFalse();
        expect(SiamPiece.DARK_DOWN.belongTo(Player.ONE)).toBeTrue();
        expect(SiamPiece.LIGHT_RIGHT.belongTo(Player.ZERO)).toBeTrue();
        expect(SiamPiece.LIGHT_RIGHT.belongTo(Player.ONE)).toBeFalse();
    });

    it('should give the owner of each piece with getOwner', () => {
        expect(SiamPiece.MOUNTAIN.getOwner()).toBe(PlayerOrNone.NONE);
        expect(SiamPiece.DARK_DOWN.getOwner()).toBe(Player.ONE);
        expect(SiamPiece.LIGHT_RIGHT.getOwner()).toBe(Player.ZERO);
    });

});
