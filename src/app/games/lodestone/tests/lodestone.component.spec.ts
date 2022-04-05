/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { LodestoneComponent } from '../lodestone.component';
import { LodestoneMove } from '../LodestoneMove';

fdescribe('LodestoneComponent', () => {
    let testUtils: ComponentTestUtils<LodestoneComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<LodestoneComponent>('Lodestone');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    it('should allow placing a lodestone by selecting it and then clicking on an empty square', fakeAsync(async() => {
        // Given the initial state
        // When clicking on a lodestone and then on an empty square
        await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
        // Then the move should succeed (in case this is a move without capture)
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', false);
        await testUtils.expectMoveSuccess('#square_0_0', move);
    }));
    it('should allow placing a lodestone by clicking on an empty square and then selecting a lodestone', fakeAsync(async() => {
        // Given the initial state
        // When clicking on a on an empty square and then on a lodestone
        await testUtils.expectClickSuccess('#square_0_0');
        // Then the move should succeed (in case this is a move without capture)
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', false);
        await testUtils.expectMoveSuccess('#lodestone_push_orthogonal', move);
    }));
    it('should forbid placing a lodestone on an occupied square', fakeAsync(async() => {
        // Given the initial state
        // When clicking on a an occupied square
        // Then the move should fail
        await testUtils.expectClickFailure('#square_1_1', RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
    }));
    it('should highlight the selected square', fakeAsync(async() => {
        // Given the initial state
        // When clicking on a square
        await testUtils.expectClickSuccess('#square_0_0');
        // Then it should be selected
        testUtils.expectElementToExist('#selection_0_0');
    }));
    it('should highlight the selected lodestone', fakeAsync(async() => {
        // Given the initial state
        // When clicking of a lodestone
        await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
        // Then it should be selected
        testUtils.expectElementToHaveClass('#lodestone_push_orthogonal > .outside', 'selected');
    }));
    fit('should deselect lodestone and square after move has been made', fakeAsync(async() => {
        // Given a state
        await testUtils.expectClickSuccess('#square_0_0');
        // When performing a move
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', false);
        await testUtils.expectMoveSuccess('#lodestone_push_orthogonal', move);
        // Then the selected lodestone and square should not be highlighted
        testUtils.expectElementNotToHaveClass('#lodestone_push_orthogonal > .outside', 'selected');
        testUtils.expectElementNotToExist('#selection_0_0');
    }));
    it('should show intermediary state before placing captures', fakeAsync(async() => {
        // Given the initial state
        // When The player places the lodestone, but the move is not finished yet
        await testUtils.expectClickSuccess('#square_3_3');
        await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
        // Then the lodestone should be shown on the board, and the moved pieces too
        testUtils.expectElementToExist('#square_3_3 > .lodestone');
        testUtils.expectElementNotToExist('#square_3_0 > circle');
    }));
    it('should put captures on the selected pressure plate', fakeAsync(async() => {
        // Given an intermediary state where a lodestone has been placed, resulting in 2 captures
        await testUtils.expectClickSuccess('#square_3_3');
        await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
        // When the the player clicks on the plates where the captures will go
        await testUtils.expectClickSuccess('#pressurePlate_top');
        testUtils.expectElementToExist('#platePiece_top_0');
        // Then the move should be performed, and the captures should be shown
        const move: LodestoneMove = new LodestoneMove(new Coord(3, 3), 'push', false, { top: 2, bottom: 0, left: 0, right: 0 });
        await testUtils.expectMoveSuccess('#pressurePlate_top', move);
        testUtils.expectElementToExist('#platePiece_top_1');
    }));
    it('should crumble a pressure plate when full', fakeAsync(async() => {
    }));
    it('should crumble a pressure plate also in the middle of placing capture', fakeAsync(async() => {
    }));
    it('should reallow selecting any lodestone face if a lodestone is not on the board', fakeAsync(async() => {
    }));
});
