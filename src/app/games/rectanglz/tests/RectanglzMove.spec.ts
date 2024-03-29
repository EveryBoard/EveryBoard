/* eslint-disable max-lines-per-function */
import { RectanglzMove } from '../RectanglzMove';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallibleTestUtils } from 'src/app/utils/tests/MGPFallible.spec';

describe('RectanglzMove', () => {

    describe('from', () => {

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
