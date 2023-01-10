/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { TrexoComponent, TrexoComponentFailure } from '../trexo.component';
import { TrexoMove } from '../TrexoMove';

// eslint-disable-next-line max-lines-per-function
fdescribe('TrexoComponent', () => {

    let testUtils: ComponentTestUtils<TrexoComponent>;

    async function doMove(zero: Coord, one: Coord) {
        let opponent: Coord = zero;
        let player: Coord = one;
        if (testUtils.getComponent().getTurn() % 2 === 0) {
            opponent = one;
            player = zero;
        }
        await testUtils.expectClickSuccess('#space_' + opponent.x + '_' + opponent.y);
        const move: TrexoMove = TrexoMove.from(zero, one).get();
        await testUtils.expectMoveSuccess('#space_' + player.x + '_' + player.y, move);
    }

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
            testUtils.expectElementToExist('#dropped_piece_5_5_0');
        }));
        it(`should fail when clicking on an isolated piece`, fakeAsync(async() => {
            // Given a board on which one space is higher than all it's neighbooring space (except it's "twin")
            await doMove(new Coord(0, 0), new Coord(0, 1));

            // When trying to choose it as first coord
            // Then it should fail
            const reason: string = TrexoComponentFailure.NO_WAY_TO_DROP_IT_HERE();
            await testUtils.expectClickFailure('#space_0_0', reason);
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
        it('should allow clicking on second level', fakeAsync(async() => {
            // Given any board where two neighboring tiles are on the same level
            await testUtils.expectClickSuccess('#space_5_5');
            let move: TrexoMove = TrexoMove.from(new Coord(5, 6), new Coord(5, 5)).get();
            await testUtils.expectMoveSuccess('#space_5_6', move);
            await testUtils.expectClickSuccess('#space_6_5');
            move = TrexoMove.from(new Coord(6, 5), new Coord(6, 6)).get();
            await testUtils.expectMoveSuccess('#space_6_6', move);

            // When clicking on one of them
            await testUtils.expectClickSuccess('#space_5_5');

            // Then the droppedPiece should appear on it
            testUtils.expectElementToExist('#dropped_piece_5_5_1');
        }));
    });
    describe(`second click`, () => {
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
            testUtils.expectElementNotToExist('#dropped_piece_5_5_0');
            testUtils.expectElementToExist('#dropped_piece_7_7_0');
        }));
        it(`should show last move`, fakeAsync(async() => {
            // Given any board on which a first click has been made
            await testUtils.expectClickSuccess('#space_5_5');

            // When finalizing the move
            const move: TrexoMove = TrexoMove.from(new Coord(4, 5), new Coord(5, 5)).get();
            await testUtils.expectMoveSuccess('#space_4_5', move);

            // Then the dropped coords should be highlighted
            testUtils.expectElementToHaveClass('#tile_4_5_0', 'last-move-stroke');
            testUtils.expectElementToHaveClass('#tile_5_5_0', 'last-move-stroke');
        }));
        it(`should cancel move when clicking again on the same coord`, fakeAsync(async() => {
            // Given any board on which a first click has been made
            await testUtils.expectClickSuccess('#space_5_5');

            // When clicking on the same coord again
            // Then the move should be cancelled without toast
            await testUtils.expectClickSuccess('#space_5_5');
            // And the piece deselected
            testUtils.expectElementNotToExist('#dropped_piece_5_5');
        }));
        it('should highlight victory', fakeAsync(async() => {
            // Given any board on which a 4 moves have already been done, aligning piece of Player.ZERO
            await doMove(new Coord(3, 3), new Coord(3, 2));
            await doMove(new Coord(4, 3), new Coord(4, 4));
            await doMove(new Coord(5, 3), new Coord(5, 2));
            await doMove(new Coord(6, 3), new Coord(6, 4));
            await testUtils.expectClickSuccess('#space_7_2');

            // When doing the victorious move
            const move: TrexoMove = TrexoMove.from(new Coord(7, 3), new Coord(7, 2)).get();

            // Then the 5 victory coords should be highlighted
            await testUtils.expectMoveSuccess('#space_7_3', move);
            testUtils.expectElementToHaveClass('#tile_3_3_0', 'victory-stroke');
            testUtils.expectElementToHaveClass('#tile_4_3_0', 'victory-stroke');
            testUtils.expectElementToHaveClass('#tile_5_3_0', 'victory-stroke');
            testUtils.expectElementToHaveClass('#tile_6_3_0', 'victory-stroke');
            testUtils.expectElementToHaveClass('#tile_7_3_0', 'victory-stroke');
        }));
    });
});
