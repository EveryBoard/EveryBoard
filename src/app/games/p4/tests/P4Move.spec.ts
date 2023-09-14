/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { P4Move } from '../P4Move';

describe('P4Move', () => {

    describe('of', () => {
        it('should assign the correct x property', () => {
            for (let i: number = 0; i < 7; i++) {
                expect(P4Move.of(i).x).toBe(i);
            }
        });
    });
    describe('equals', () => {
        it('should consider identical move equal', () => {
            const move: P4Move = P4Move.of(5);
            expect(move.equals(move)).toBeTrue();
        });
        it('should consider different moves non equal', () => {
            const move1: P4Move = P4Move.of(5);
            const move2: P4Move = P4Move.of(6);
            expect(move1.equals(move2)).toBeFalse();
        });
    });
    it('should have a bijective encoder', () => {
        const move: P4Move = P4Move.of(3);
        EncoderTestUtils.expectToBeBijective(P4Move.encoder, move);
    });
    describe('toString', () => {
        it('should contain information on the column', () => {
            const move: P4Move = P4Move.of(1);
            expect(move.toString()).toBe('P4Move(1)');
        });
    });
});
