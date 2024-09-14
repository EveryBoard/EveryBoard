/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { EncapsulePiece, Size } from '../EncapsulePiece';

fdescribe('EncapsulePiece', () => {

    describe('ofSizeAndPlayer', () => {

        it('should construct the expected piece', () => {
            const piece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.BIG, Player.ONE);
            expect(piece.getPlayer()).toEqual(Player.ONE);
            expect(piece.getSize()).toEqual(Size.BIG);
        });

        it('should return the none piece if size is none', () => {
            // Given a piece with Size.NONE
            const piece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.NONE, PlayerOrNone.ZERO);

            // When checking it's player and size
            // Then player should be NONE
            expect(piece.getPlayer()).toEqual(PlayerOrNone.NONE);
            // And piece should be NONE as well
            expect(piece.getSize()).toEqual(Size.NONE);
        });

        it('should return the none piece if player is none', () => {
            // Given a piece with Player.NONE
            const piece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.BIG, PlayerOrNone.NONE);

            // When checking it's player and size
            // Then player should be NONE
            expect(piece.getPlayer()).toEqual(PlayerOrNone.NONE);
            // And piece should be NONE as well
            expect(piece.getSize()).toEqual(Size.NONE);
        });

    });

    describe('getPlayer', () => {

        it('should return the owner of the piece', () => {
            const piece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.BIG, PlayerOrNone.ZERO);
            expect(piece.getPlayer()).toBe(Player.ZERO);
        });

    });

    describe('getSize', () => {

        it('should return the size of the piece', () => {
            const piece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.MEDIUM, PlayerOrNone.ZERO);
            expect(piece.getSize()).toBe(Size.MEDIUM);
        });

    });

    describe('belongsTo', () => {

        it('should identify that a piece belong to its owner only', () => {
            const piece: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.MEDIUM, PlayerOrNone.ZERO);
            expect(piece.belongsTo(Player.ZERO)).toBeTrue();
            expect(piece.belongsTo(Player.ONE)).toBeFalse();
        });

    });

});
