/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { KalahMove } from '../KalahMove';
import { MancalaMove } from '../../MancalaMove';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

describe('KalahMove', () => {

    describe('toString', () => {
        it('should be defined', () => {
            const move: KalahMove = new KalahMove(MancalaMove.ZERO);
            expect(move.toString()).toBe('KalahMove[0]');
        });
    });
    it('should be iterable', () => {
        // Given a move with several sub move
        const move: KalahMove = new KalahMove(MancalaMove.ONE, [MancalaMove.TWO]);
        const subMoveList: MancalaMove[] = [];

        // When iterating on it
        for (const subMove of move) {
            subMoveList.push(subMove);
        }

        // Then it should give us the moves in the good order
        const expectedSubMoveList: MancalaMove[] = [MancalaMove.ONE, MancalaMove.TWO];
        expect(ArrayUtils.compareArray(subMoveList, expectedSubMoveList)).toBeTrue();
    });
    describe('add', () => {
        it('should return new move with one more subMoves at the end', () => {
            // Given a basic move
            const move: KalahMove = new KalahMove(MancalaMove.ZERO);

            // When calling "add(subMove)" on it
            const longerMove: KalahMove = move.add(MancalaMove.ONE);

            // Then whe should have a new move
            expect(longerMove).toEqual(new KalahMove(MancalaMove.ZERO, [MancalaMove.ONE]));
        });
    });
    describe('equals', () => {
        it('should return true for the same move', () => {
            const move: KalahMove = new KalahMove(MancalaMove.ZERO);
            const twin: KalahMove = new KalahMove(MancalaMove.ZERO);
            expect(move.equals(twin)).toBeTrue();
        });
        it('should return false for another move', () => {
            const move: KalahMove = new KalahMove(MancalaMove.ZERO);
            const other: KalahMove = new KalahMove(MancalaMove.ONE);
            expect(move.equals(other)).toBeFalse();
        });
        it('should return false for a longer move', () => {
            const move: KalahMove = new KalahMove(MancalaMove.ZERO);
            const other: KalahMove = new KalahMove(MancalaMove.ZERO, [MancalaMove.ONE]);
            expect(move.equals(other)).toBeFalse();
        });
    });
    describe('encoder', () => {
        it('should be bijective', () => {
            const moves: KalahMove[] = [
                new KalahMove(MancalaMove.ZERO),
                new KalahMove(MancalaMove.ONE, [MancalaMove.TWO]),
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(KalahMove.encoder, move);
            }
        });
    });
});
