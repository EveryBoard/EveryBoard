/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { TrexoComponent, TrexoComponentFailure } from '../trexo.component';
import { TrexoMove } from '../TrexoMove';
import { TrexoSpace, TrexoState } from '../TrexoState';

const _____: TrexoSpace = TrexoSpace.EMPTY;
const O1_T0: TrexoSpace = new TrexoSpace(Player.ZERO, 1, 0);
const O1_T1: TrexoSpace = new TrexoSpace(Player.ZERO, 1, 1);
const O2_T2: TrexoSpace = new TrexoSpace(Player.ZERO, 2, 2);
const O1_T3: TrexoSpace = new TrexoSpace(Player.ZERO, 1, 3);
const X1_T0: TrexoSpace = new TrexoSpace(Player.ONE, 1, 0);
const X1_T1: TrexoSpace = new TrexoSpace(Player.ONE, 1, 1);
const X2_T2: TrexoSpace = new TrexoSpace(Player.ONE, 2, 2);
const X1_T3: TrexoSpace = new TrexoSpace(Player.ONE, 1, 3);

// eslint-disable-next-line max-lines-per-function
fdescribe('TrexoComponent', () => {

    let testUtils: ComponentTestUtils<TrexoComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<TrexoComponent>('Trexo');
    }));
    describe('first click', () => {
        it(`should drop the opponent's piece first`, fakeAsync(async() => {
            // Given any board
            // When clicking on a possible first coord
            // Then the click should be a success
            await testUtils.expectClickSuccess('#space_5_5');
            // and a dropped piece for the opponent should be displayed
            testUtils.expectElementToExist('#piece_one_5_5');
        }));
        it(`should fail when clicking on an isolated piece`, fakeAsync(async() => {
            // Given a board on which one space is higher than all it's neighbooring space (except it's "twin")
            const state: TrexoState = TrexoState.from([
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, X1_T0, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, O1_T0, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            ], 1).get();
            testUtils.setupState(state);

            // When trying to choose it as first coord
            // Then it should fail
            const reason: string = TrexoComponentFailure.NO_WAY_TO_DROP_IT_HERE();
            await testUtils.expectClickFailure('#space_4_4', reason);
        }));
        it('should show possible next click amongst the possible neigbhors', fakeAsync(async() => {
            // Given any board
            // When clicking on a possible first coord
            await testUtils.expectClickSuccess('#space_5_5');
            // Then the possible next click should be highlighted
            testUtils.expectElementToExist('#indicator_4_5');
            testUtils.expectElementToExist('#indicator_6_5');
            testUtils.expectElementToExist('#indicator_5_4');
            testUtils.expectElementToExist('#indicator_5_6');
        }));
    });
    fdescribe(`second click`, () => {
        it(`should allow legal move`, fakeAsync(async() => {
            // Given any board on which a first click has been made
            await testUtils.expectClickSuccess('#space_5_5');

            // When clicking on a valid neighbor coord
            // Then the move should be a success, and the first click should be the piece of Player.ONE
            // Because the opponent piece is dropped first
            const move: TrexoMove = TrexoMove.from(new Coord(6, 5), new Coord(5, 5)).get();
            await testUtils.expectMoveSuccess('#space_6_5', move);
        }));
        it(`should change the first dropped coord when clicking too far`, fakeAsync(async() => {
            // Given any board on which a first click has been made
            await testUtils.expectClickSuccess('#space_5_5');

            // When clicking on a far away coord (that is still valid)
            // Then the click should be a success
            await testUtils.expectClickSuccess('#space_7_7');
            // And the dropped piece changed
            testUtils.expectElementNotToExist('#piece_one_5_5');
            testUtils.expectElementToExist('#piece_one_7_7');
        }));
        it(`should show last move`, fakeAsync(async() => {
            // Given any board on which a first click has been made
            await testUtils.expectClickSuccess('#space_5_5');

            // When finalizing the move
            const move: TrexoMove = TrexoMove.from(new Coord(4, 5), new Coord(5, 5)).get();
            await testUtils.expectMoveSuccess('#space_4_5', move);

            // Then the dropped coords should be highlighted
            testUtils.expectElementToHaveClass('#piece_4_5', 'last-move-stroke');
            testUtils.expectElementToHaveClass('#piece_5_5', 'last-move-stroke');
        }));
        it(`should cancel move when clicking again on the same coord`, fakeAsync(async() => {
            // Given any board on which a first click has been made
            await testUtils.expectClickSuccess('#space_5_5');

            // When clicking on the same coord again
            // Then the move should be cancelled without toast
            await testUtils.expectClickSuccess('#space_5_5');
            // And the piece deselected
            testUtils.expectElementNotToExist('#piece_one_5_5');
        }));
        it('should highlight victory', fakeAsync(async() => {
            // Given any board on which a first click has been made and a victory is possible
            const state: TrexoState = TrexoState.from([
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, O1_T0, _____, O2_T2, _____, _____, _____, _____],
                [_____, _____, _____, X1_T0, X1_T1, X2_T2, X1_T3, _____, _____, _____],
                [_____, _____, _____, _____, O1_T1, _____, O1_T3, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            ], 4).get();
            testUtils.setupState(state);
            await testUtils.expectClickSuccess('#space_7_3');

            // When doing the victorious move
            const move: TrexoMove = TrexoMove.from(new Coord(7, 2), new Coord(7, 3)).get();

            // Then the 5 victory coords should be highlighted
            await testUtils.expectMoveSuccess('#space_7_2', move);
            testUtils.expectElementToHaveClass('#piece_3_3', 'victory-stroke');
            testUtils.expectElementToHaveClass('#piece_4_3', 'victory-stroke');
            testUtils.expectElementToHaveClass('#piece_5_3', 'victory-stroke');
            testUtils.expectElementToHaveClass('#piece_6_3', 'victory-stroke');
            testUtils.expectElementToHaveClass('#piece_7_3', 'victory-stroke');
        }));
    });
});
