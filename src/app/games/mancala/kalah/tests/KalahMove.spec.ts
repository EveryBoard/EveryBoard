/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { KalahMove } from '../KalahMove';
import { MancalaDistribution } from '../../common/MancalaMove';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

describe('KalahMove', () => {

    describe('toString', () => {
        it('should be defined', () => {
            const move: KalahMove = KalahMove.of(MancalaDistribution.of(0));
            expect(move.toString()).toBe('KalahMove([0])');
        });
    });

    it('should be iterable', () => {
        // Given a move with several distributions
        const move: KalahMove = KalahMove.of(MancalaDistribution.of(1), [MancalaDistribution.of(2)]);
        const distributions: MancalaDistribution[] = [];

        // When iterating on it
        for (const distribution of move) {
            distributions.push(distribution);
        }

        // Then it should give us the moves in the expected order
        const expectedDistributions: MancalaDistribution[] = [MancalaDistribution.of(1), MancalaDistribution.of(2)];
        expect(ArrayUtils.compare(distributions, expectedDistributions)).toBeTrue();
    });

    describe('add', () => {
        it('should return new move with one more distribution at the end', () => {
            // Given a basic move
            const move: KalahMove = KalahMove.of(MancalaDistribution.of(0));

            // When calling "add(distribution)" on it
            const longerMove: KalahMove = move.add(MancalaDistribution.of(1));

            // Then whe should have a new move
            expect(longerMove).toEqual(KalahMove.of(MancalaDistribution.of(0), [MancalaDistribution.of(1)]));
        });
    });

    describe('equals', () => {
        it('should return true for the same move', () => {
            const move: KalahMove = KalahMove.of(MancalaDistribution.of(0));
            const twin: KalahMove = KalahMove.of(MancalaDistribution.of(0));
            expect(move.equals(twin)).toBeTrue();
        });
        it('should return false for another move', () => {
            const move: KalahMove = KalahMove.of(MancalaDistribution.of(0));
            const other: KalahMove = KalahMove.of(MancalaDistribution.of(1));
            expect(move.equals(other)).toBeFalse();
        });
        it('should return false for a longer move', () => {
            const move: KalahMove = KalahMove.of(MancalaDistribution.of(0));
            const other: KalahMove = KalahMove.of(MancalaDistribution.of(0), [MancalaDistribution.of(1)]);
            expect(move.equals(other)).toBeFalse();
        });
    });

    describe('encoder', () => {
        it('should be bijective', () => {
            const moves: KalahMove[] = [
                KalahMove.of(MancalaDistribution.of(0)),
                KalahMove.of(MancalaDistribution.of(1), [MancalaDistribution.of(2)]),
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(KalahMove.encoder, move);
            }
        });
    });
});
