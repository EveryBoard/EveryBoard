/* eslint-disable max-lines-per-function */
import { SquarzMove } from '../SquarzMove';
import { MGPFallible, MGPFallibleTestUtils } from '@everyboard/lib';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('SquarzMove', () => {

    describe('from', () => {

        it('should succeed when making "knight move"', () => {
            // When trying to create a knight kind of move
            const fallible: MGPFallible<SquarzMove> = SquarzMove.from(new Coord(0, 0), new Coord(1, 2));

            // Then it should be a success
            MGPFallibleTestUtils.expectToBeSuccess(fallible);
        });

        it('should succeed when making valid duplication move', () => {
            // When trying to create a duplication
            const fallible: MGPFallible<SquarzMove> = SquarzMove.from(new Coord(0, 0), new Coord(1, 0));

            // Then it should be a success
            MGPFallibleTestUtils.expectToBeSuccess(fallible);
        });

        it('should succeed when making valid jump move', () => {
            // When trying to create a jump
            const fallible: MGPFallible<SquarzMove> = SquarzMove.from(new Coord(0, 0), new Coord(2, 2));

            // Then it should be a success
            MGPFallibleTestUtils.expectToBeSuccess(fallible);
        });

        it('should fail when making static move', () => {
            // When trying to create a non-move
            const fallible: MGPFallible<SquarzMove> = SquarzMove.from(new Coord(0, 0), new Coord(0, 0));

            // Then it should be a success
            MGPFallibleTestUtils.expectToBeFailure(fallible, RulesFailure.MOVE_CANNOT_BE_STATIC());
        });

    });

});
