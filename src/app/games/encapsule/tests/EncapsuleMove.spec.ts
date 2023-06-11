/* eslint-disable max-lines-per-function */
import { EncapsuleNode, EncapsuleRules } from '../EncapsuleRules';
import { EncapsuleMinimax } from '../EncapsuleMinimax';
import { Coord } from 'src/app/jscaip/Coord';
import { EncapsulePiece } from '../EncapsulePiece';
import { EncapsuleMove } from '../EncapsuleMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';

describe('EncapsuleMove', () => {

    it('should construct valid moves with success', () => {
        expect(EncapsuleMove.ofDrop(EncapsulePiece.SMALL_DARK, new Coord(2, 1))).toBeTruthy();
        expect(EncapsuleMove.ofMove(new Coord(1, 1), new Coord(2, 1))).toBeTruthy();
    });
    it('should throw when move has the same starting and landing coords', () => {
        expect(() => EncapsuleMove.ofMove(new Coord(2, 1), new Coord(2, 1))).toThrow();
    });
    describe('encoder', () => {
        it('should be bijective for first turn moves', () => {
            const rules: EncapsuleRules = EncapsuleRules.get();
            const minimax: EncapsuleMinimax = new EncapsuleMinimax(rules, 'EncapsuleMinimax');
            const node: EncapsuleNode = rules.getInitialNode();
            const firstTurnMoves: EncapsuleMove[] = minimax.getListMoves(node);
            for (const move of firstTurnMoves) {
                EncoderTestUtils.expectToBeBijective(EncapsuleMove.encoder, move);
            }
        });
        it('should be bijective for moves', () => {
            const move: EncapsuleMove = EncapsuleMove.ofMove(new Coord(1, 1), new Coord(2, 2));
            EncoderTestUtils.expectToBeBijective(EncapsuleMove.encoder, move);
        });
    });
    describe('equals', () => {
        it('should consider same move equal', () => {
            const moveA: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 0));
            const moveB: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 0));
            expect(moveA.equals(moveA)).toBeTrue();
            expect(moveA.equals(moveB)).toBeTrue();
        });
        it('should consider moves different due to different landing coord', () => {
            const moveA: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 0));
            const moveB: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 1));
            expect(moveA.equals(moveB)).toBeFalse();
        });
        it('should consider moves different due to different starting coord', () => {
            const moveA: EncapsuleMove = EncapsuleMove.ofMove(new Coord(0, 0), new Coord(2, 2));
            const moveB: EncapsuleMove = EncapsuleMove.ofMove(new Coord(0, 1), new Coord(2, 2));
            expect(moveA.equals(moveB)).toBeFalse();
        });
        it('should consider moves different due to different piece', () => {
            const moveA: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 0));
            const moveB: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.MEDIUM_DARK, new Coord(0, 1));
            expect(moveA.equals(moveB)).toBeFalse();
        });
    });
    describe('toString', () => {
        it('should be defined', () => {
            expect(EncapsuleMove.ofDrop(EncapsulePiece.SMALL_DARK, new Coord(2, 1)).toString()).toBeTruthy();
            expect(EncapsuleMove.ofMove(new Coord(1, 1), new Coord(2, 1)).toString()).toBeTruthy();
        });
    });
});
