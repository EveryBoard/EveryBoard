/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { EncapsulePiece, Size } from '../EncapsulePiece';

describe('EncapsulePiece', () => {

    describe('of', () => {

        it('should construct a piece for all valid values', () => {
            for (let i: number = 0; i < 7; i++) {
                expect(EncapsulePiece.of(i)).toBeTruthy();
            }
        });

        it('should fail on invalid piece values', () => {
            expect(() => EncapsulePiece.of(42)).toThrow();
        });

    });

    describe('ofSizeAndPlayer', () => {

        it('should construct the expected piece', () => {
            expect(EncapsulePiece.ofSizeAndPlayer(Size.BIG, Player.ONE)).toBe(EncapsulePiece.BIG_LIGHT);
        });

        it('should return the none piece if player or size is none', () => {
            expect(EncapsulePiece.ofSizeAndPlayer(Size.NONE, Player.ONE)).toBe(EncapsulePiece.NONE);
            expect(EncapsulePiece.ofSizeAndPlayer(Size.BIG, PlayerOrNone.NONE)).toBe(EncapsulePiece.NONE);
        });

    });

    describe('getPlayer', () => {

        it('should return the owner of the piece', () => {
            expect(EncapsulePiece.SMALL_DARK.getPlayer()).toBe(Player.ZERO);
        });

    });

    describe('getSize', () => {

        it('should return the size of the piece', () => {
            expect(EncapsulePiece.SMALL_DARK.getSize()).toBe(Size.SMALL);
        });

    });

    describe('belongsTo', () => {

        it('should identify that a piece belong to its owner only', () => {
            expect(EncapsulePiece.SMALL_DARK.belongsTo(Player.ZERO)).toBeTrue();
            expect(EncapsulePiece.SMALL_DARK.belongsTo(Player.ONE)).toBeFalse();
        });

    });

});
