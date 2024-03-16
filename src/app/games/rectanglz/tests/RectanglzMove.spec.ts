/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { RectanglzMove } from '../RectanglzMove';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallibleTestUtils } from 'src/app/utils/tests/MGPFallible.spec';
import { RectanglzFailure } from '../RectanglzFailure';

fdescribe('RectanglzMove', () => {

    describe('toString', () => {

        it('should be defined', () => {
            // const move: RectanglzMove = new RectanglzMove();
            // expect(move.toString()).toBe('This method is really more debug oriented');
        });

    });

    describe('equals', () => {

        it('should return true for the same move', () => {
        //     const move: RectanglzMove = new RectanglzMove();
        //     const identical: RectanglzMove = new RectanglzMove();
        //     // Here you should rather test
        //     // expect(move.equals(identical)).toBeTrue();
        //     expect(() => move.equals(identical)).toThrow();
        });

        // it('should return false for another move', () => {
        //     const move: RectanglzMove = new RectanglzMove();
        //     const different: RectanglzMove = new RectanglzMove();
        //     // Here you should rather test
        //     // expect(move.equals(different)).toBeTrue();
        //     expect(() => move.equals(different)).toThrow();
        // });

    });

    describe('encoder', () => {

        it('should be bijective', () => {
            // We want to ensure that decoding an encoded move returns the same move.
            // Use `EncoderTestUtils.expectToBeBijective` for this.
            const moves: RectanglzMove[] = [
                // Some of your moves
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(RectanglzMove.encoder, move);
            }
        });

    });

    describe('from', () => {

        it('should fail when making jump longer than 2', () => {
            // When trying to create a jump of 3
            const fallible: MGPFallible<RectanglzMove> = RectanglzMove.from(new Coord(0, 0), new Coord(3, 3));

            // Then it should be a failure
            MGPFallibleTestUtils.expectToBeFailure(fallible, RectanglzFailure.MAX_DISTANCE_IS_2());
        });

        it('should succeed when making "knight move"', () => {
            // When trying to create a knight kind of move
            const fallible: MGPFallible<RectanglzMove> = RectanglzMove.from(new Coord(0, 0), new Coord(1, 2));

            // Then it should be a failure
            MGPFallibleTestUtils.expectToBeSuccess(fallible);
        });

        it('should succeed when making valid duplication move', () => {
            // When trying to create a single step
            const fallible: MGPFallible<RectanglzMove> = RectanglzMove.from(new Coord(0, 0), new Coord(1, 0));

            // Then it should be a success
            MGPFallibleTestUtils.expectToBeSuccess(fallible);
        });

        it('should succeed when making valid jump move', () => {
            // When trying to create a doublestep
            const fallible: MGPFallible<RectanglzMove> = RectanglzMove.from(new Coord(0, 0), new Coord(2, 2));

            // Then it should be a success
            MGPFallibleTestUtils.expectToBeSuccess(fallible);
        });

    });

});
