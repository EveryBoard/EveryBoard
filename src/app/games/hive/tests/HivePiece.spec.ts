/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { HivePiece, HivePieceStack } from '../HivePiece';

const Q: HivePiece = new HivePiece(Player.ZERO, 'QueenBee');
const B: HivePiece = new HivePiece(Player.ZERO, 'Beetle');
const q: HivePiece = new HivePiece(Player.ONE, 'QueenBee');
const b: HivePiece = new HivePiece(Player.ONE, 'Beetle');

describe('HivePiece', () => {
    it('should define toString', () => {
        expect(Q.toString()).toEqual('QueenBee_PLAYER_ZERO');
    });
    it('should define equality', () => {
        expect(Q.equals(Q)).toBeTrue();
        expect(Q.equals(q)).toBeFalse();
        expect(Q.equals(B)).toBeFalse();
    });
});

describe('HivePieceStack', () => {
    it('should redefine equals', () => {
        const emptyStack: HivePieceStack = HivePieceStack.EMPTY;
        const onePieceStack: HivePieceStack = new HivePieceStack([Q]);
        const twoPiecesStack: HivePieceStack = new HivePieceStack([B, Q]);
        const otherTwoPiecesStack: HivePieceStack = new HivePieceStack([b, Q]);
        expect(emptyStack.equals(onePieceStack)).toBeFalse();
        expect(onePieceStack.equals(twoPiecesStack)).toBeFalse();
        expect(twoPiecesStack.equals(otherTwoPiecesStack)).toBeFalse();
        expect(twoPiecesStack.equals(twoPiecesStack)).toBeTrue();
    });
});
