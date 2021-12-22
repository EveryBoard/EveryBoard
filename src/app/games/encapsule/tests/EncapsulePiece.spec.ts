/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
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
            expect(EncapsulePiece.ofSizeAndPlayer(Size.MEDIUM, Player.ONE)).toBe(EncapsulePiece.MEDIUM_WHITE);
        });
        it('should return the none piece if player or size is none', () => {
            expect(EncapsulePiece.ofSizeAndPlayer(Size.NONE, Player.ONE)).toBe(EncapsulePiece.NONE);
            expect(EncapsulePiece.ofSizeAndPlayer(Size.BIG, Player.NONE)).toBe(EncapsulePiece.NONE);
        });
    });
    describe('getPlayer', () => {
        it('should return the owner of the piece', () => {
            expect(EncapsulePiece.SMALL_BLACK.getPlayer()).toBe(Player.ZERO);
        });
    });
    describe('getSize', () => {
        it('should return the size of the piece', () => {
            expect(EncapsulePiece.SMALL_BLACK.getSize()).toBe(Size.SMALL);
        });
    });
    describe('belongsTo', () => {
        it('should identify that a piece belong to its owner only', () => {
            expect(EncapsulePiece.SMALL_BLACK.belongsTo(Player.ZERO)).toBeTrue();
            expect(EncapsulePiece.SMALL_BLACK.belongsTo(Player.ONE)).toBeFalse();
            expect(EncapsulePiece.SMALL_BLACK.belongsTo(Player.NONE)).toBeFalse();
        });
    });
});
