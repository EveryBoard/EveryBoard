/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { Orthogonal } from '@everyboard/games';
import { PlayerOrNone } from '@everyboard/games';
import { RulesFailure } from '@everyboard/games';
import { Table } from '@everyboard/games';
import { QuixoMove } from '@everyboard/games';
import { QuixoState } from '@everyboard/games';
import { ComponentTestUtils } from '../../../utils/tests/TestUtils.spec';

import { QuixoFailure } from '@everyboard/games';
import { QuixoComponent } from '../quixo.component';

describe('QuixoComponent', () => {

    let testUtils: ComponentTestUtils<QuixoComponent>;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<QuixoComponent>('Quixo');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('first click', () => {

        it('should cancel move when trying to select opponent piece', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [O, _, _, _, _],
                [_, _, _, _, _],
                [X, _, _, _, X],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: QuixoState = new QuixoState(board, 3);
            await testUtils.setupState(state);

            await testUtils.expectClickFailure('#click-0-0', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }));

        it('should cancel move when trying to select center coord', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [O, _, _, _, _],
                [_, _, _, _, _],
                [X, _, _, _, X],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: QuixoState = new QuixoState(board, 3);
            await testUtils.setupState(state);

            await testUtils.expectClickFailure('#click-1-1', QuixoFailure.NO_INSIDE_CLICK());
        }));

        it('should show insertion directions when clicking on a border space', fakeAsync(async() => {
            // Given a board
            // When selecting a coord
            await testUtils.expectClickSuccess('#click-0-0');

            // Then the direction in which this piece can go should be displayed
            testUtils.expectElementToExist('#choose-direction-DOWN');
            testUtils.expectElementToExist('#choose-direction-RIGHT');
            testUtils.expectElementNotToExist('#choose-direction-LEFT');
            testUtils.expectElementNotToExist('#choose-direction-UP');
        }));

        it('should select coord when clicking on it', fakeAsync(async() => {
            // Given a board
            // When clicking on one outside coord
            await testUtils.expectClickSuccess('#click-0-0');

            // Then it should be selected
            testUtils.expectElementToHaveClass('#click-0-0', 'selected-stroke');
        }));

    });

    describe('second click', () => {

        it('should allow a simple move', fakeAsync(async() => {
            // Given any board with a selected coord
            await testUtils.expectClickSuccess('#click-4-0');

            // When choosing a direction and finalising the move
            // Then the move should succeed
            await testUtils.expectMoveSuccess('#choose-direction-LEFT', new QuixoMove(4, 0, Orthogonal.LEFT));
        }));

        it('should allow a simple move upwards', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#click-4-4');
            await testUtils.expectMoveSuccess('#choose-direction-UP', new QuixoMove(4, 4, Orthogonal.UP));
        }));

        it('should deselect coord when clicking on it again', fakeAsync(async() => {
            // Given a board with a selected coord
            await testUtils.expectClickSuccess('#click-0-0');

            // When clicking on it again
            await testUtils.expectClickFailure('#click-0-0');

            // Then it should no longer be selected
            testUtils.expectElementNotToHaveClass('#click-0-0', 'selected-stroke');
        }));

    });

    describe('visuals', () => {

        it('should highlight victory', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [O, O, O, O, O],
                [_, _, _, _, _],
                [X, _, _, _, X],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: QuixoState = new QuixoState(board, 3);
            await testUtils.setupState(state);

            expect(testUtils.getGameComponent().getPieceClasses(0, 0)).toContain('victory-stroke');
            expect(testUtils.getGameComponent().getPieceClasses(1, 0)).toContain('victory-stroke');
            expect(testUtils.getGameComponent().getPieceClasses(2, 0)).toContain('victory-stroke');
            expect(testUtils.getGameComponent().getPieceClasses(3, 0)).toContain('victory-stroke');
            expect(testUtils.getGameComponent().getPieceClasses(4, 0)).toContain('victory-stroke');
        }));

        it('should highlight all moved coords', fakeAsync(async() => {
            // Given any board
            await testUtils.expectClickSuccess('#click-2-0');

            // When choosing a direction and finalising the move
            await testUtils.expectMoveSuccess('#choose-direction-LEFT', new QuixoMove(2, 0, Orthogonal.LEFT));

            // Then the move coord on the line that were move should be highlighted
            testUtils.expectElementToHaveClass('#click-0-0', 'last-move-stroke');
            testUtils.expectElementToHaveClass('#click-1-0', 'last-move-stroke');
            testUtils.expectElementToHaveClass('#click-2-0', 'last-move-stroke');
            // But the other should not be
            testUtils.expectElementNotToHaveClass('#click-3-0', 'last-move-stroke');
            testUtils.expectElementNotToHaveClass('#click-4-0', 'last-move-stroke');
        }));

    });

});
