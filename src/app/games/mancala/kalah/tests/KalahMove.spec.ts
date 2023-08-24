/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { KalahMove } from '../KalahMove';
import { MancalaDistribution } from '../../commons/MancalaMove';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

describe('KalahMove', () => {

    describe('toString', () => {
        it('should be defined', () => {
            const move: KalahMove = KalahMove.of(MancalaDistribution.ZERO);
            expect(move.toString()).toBe('KalahMove([0])');
        });
    });
    it('should be iterable', () => {
        // Given a move with several distributions
        const move: KalahMove = KalahMove.of(MancalaDistribution.ONE, [MancalaDistribution.TWO]);
        const subMoveList: MancalaDistribution[] = [];

        // When iterating on it
        for (const subMove of move) {
            subMoveList.push(subMove);
        }

        // Then it should give us the moves in the good order
        const expectedSubMoveList: MancalaDistribution[] = [MancalaDistribution.ONE, MancalaDistribution.TWO];
        expect(ArrayUtils.compareArray(subMoveList, expectedSubMoveList)).toBeTrue();
    });
    describe('add', () => {
        it('should return new move with one more distribution at the end', () => {
            // Given a basic move
            const move: KalahMove = KalahMove.of(MancalaDistribution.ZERO);

            // When calling "add(subMove)" on it
            const longerMove: KalahMove = move.add(MancalaDistribution.ONE);

            // Then whe should have a new move
            expect(longerMove).toEqual(KalahMove.of(MancalaDistribution.ZERO, [MancalaDistribution.ONE]));
        });
    });
    describe('equals', () => {
        it('should return true for the same move', () => {
            const move: KalahMove = KalahMove.of(MancalaDistribution.ZERO);
            const twin: KalahMove = KalahMove.of(MancalaDistribution.ZERO);
            expect(move.equals(twin)).toBeTrue();
        });
        it('should return false for another move', () => {
            const move: KalahMove = KalahMove.of(MancalaDistribution.ZERO);
            const other: KalahMove = KalahMove.of(MancalaDistribution.ONE);
            expect(move.equals(other)).toBeFalse();
        });
        it('should return false for a longer move', () => {
            const move: KalahMove = KalahMove.of(MancalaDistribution.ZERO);
            const other: KalahMove = KalahMove.of(MancalaDistribution.ZERO, [MancalaDistribution.ONE]);
            expect(move.equals(other)).toBeFalse();
        });
    });
    describe('encoder', () => {
        it('should be bijective', () => {
            const moves: KalahMove[] = [
                KalahMove.of(MancalaDistribution.ZERO),
                KalahMove.of(MancalaDistribution.ONE, [MancalaDistribution.TWO]),
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(KalahMove.encoder, move);
            }
        });
    });
});
