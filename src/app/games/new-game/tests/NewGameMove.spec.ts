import { EncoderTestUtils } from '@everyboard/lib';
import { NewGameMove } from '../NewGameMove';

describe('NewGameMove', () => {

    describe('toString', () => {

        it('should be defined', () => {
            const move: NewGameMove = new NewGameMove();
            expect(move.toString()).toBe('This method is really more debug oriented');
        });

    });

    describe('equals', () => {

        it('should return true for the same move', () => {
            const move: NewGameMove = new NewGameMove();
            const identical: NewGameMove = new NewGameMove();
            expect(move.equals(identical)).toBeTrue();
            // On top of that, you should also test that different moves should be different
        });

    });

    describe('encoder', () => {

        it('should be bijective', () => {
            // We want to ensure that decoding an encoded move returns the same move.
            // Use `EncoderTestUtils.expectToBeBijective` for this.
            const moves: NewGameMove[] = [
                // Some of your moves
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(NewGameMove.encoder, move);
            }
        });

    });

});
