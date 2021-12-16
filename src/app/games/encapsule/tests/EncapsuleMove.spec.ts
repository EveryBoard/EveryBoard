import { EncapsuleRules } from '../EncapsuleRules';
import { EncapsuleMinimax } from '../EncapsuleMinimax';
import { EncapsuleState } from '../EncapsuleState';
import { Coord } from 'src/app/jscaip/Coord';
import { EncapsulePiece } from '../EncapsulePiece';
import { EncapsuleMove } from '../EncapsuleMove';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';

describe('EncapsuleMove', () => {

    it('should construct valid moves with success', () => {
        expect(EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(2, 1))).toBeTruthy();
        expect(EncapsuleMove.fromMove(new Coord(1, 1), new Coord(2, 1))).toBeTruthy();
    });
    it('should throw when move has the same starting and landing coords', () => {
        expect(() => EncapsuleMove.fromMove(new Coord(2, 1), new Coord(2, 1))).toThrow();
    });
    describe('encoder', () => {
        it('should be correct for first turn moves', () => {
            const rules: EncapsuleRules = new EncapsuleRules(EncapsuleState);
            const minimax: EncapsuleMinimax = new EncapsuleMinimax(rules, 'EncapsuleMinimax');
            const firstTurnMoves: EncapsuleMove[] = minimax.getListMoves(rules.node);
            for (const move of firstTurnMoves) {
                NumberEncoderTestUtils.expectToBeCorrect(EncapsuleMove.encoder, move);
            }
        });
        it('should be correct for moves', () => {
            const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(1, 1), new Coord(2, 2));
            NumberEncoderTestUtils.expectToBeCorrect(EncapsuleMove.encoder, move);
        });
    });
    describe('equals', () => {
        it('should consider same move equal', () => {
            const moveA: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0));
            const moveB: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0));
            expect(moveA.equals(moveA)).toBeTrue();
            expect(moveA.equals(moveB)).toBeTrue();
        });
        it('should consider moves different due to different landing coord', () => {
            const moveA: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0));
            const moveB: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 1));
            expect(moveA.equals(moveB)).toBeFalse();
        });
        it('should consider moves different due to different starting coord', () => {
            const moveA: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 0), new Coord(2, 2));
            const moveB: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 1), new Coord(2, 2));
            expect(moveA.equals(moveB)).toBeFalse();
        });
        it('should consider moves different due to different piece', () => {
            const moveA: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0));
            const moveB: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.MEDIUM_BLACK, new Coord(0, 1));
            expect(moveA.equals(moveB)).toBeFalse();
        });
    });
    describe('toString', () => {
        it('should be defined', () => {
            expect(EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(2, 1)).toString()).toBeTruthy();
            expect(EncapsuleMove.fromMove(new Coord(1, 1), new Coord(2, 1)).toString()).toBeTruthy();
        });
    });
});
