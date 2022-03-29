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
    it('should put captures on the selected pressure plate', fakeAsync(async() => {
        // Given an intermediary state where a lodestone has been placed, resulting in 2 captures
        await testUtils.expectClickSuccess('#square_3_3');
        await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
        // When the the player clicks on the plates where the captures will go
        await testUtils.expectClickSuccess('#pressurePlate_top');
        testUtils.expectElementToExist('plate_top_0_0');
        // Then the move should be performed
        const move: LodestoneMove = new LodestoneMove(new Coord(3, 3), 'push', false, { top: 2, bottom: 0, left: 0, right: 0 });
        await testUtils.expectMoveSuccess('#pressurePlate_top', move);
        testUtils.expectElementToExist('plate_top_1_0');
    }));
    it('should crumble a pressure plate when full', fakeAsync(async() => {
    }));
    it('should crumble a pressure plate also in the middle of placing capture', fakeAsync(async() => {
    }));
    it('should reallow selecting any lodestone face if a lodestone is not on the board', fakeAsync(async() => {
    }));
});
