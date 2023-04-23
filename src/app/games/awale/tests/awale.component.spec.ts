/* eslint-disable max-lines-per-function */
import { AwaleComponent } from '../awale.component';
import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwaleState } from 'src/app/games/awale/AwaleState';
import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { AwaleFailure } from '../AwaleFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { DebugElement } from '@angular/core';

describe('AwaleComponent', () => {

    let testUtils: ComponentTestUtils<AwaleComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<AwaleComponent>('Awale');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    it('should accept simple move for player zero, show captured and moved', fakeAsync(async() => {
        // Given a state where player zero can capture
        const board: Table<number> = [
            [4, 1, 4, 4, 4, 4],
            [2, 4, 4, 4, 4, 4],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        testUtils.setupState(state);

        // When player zero clicks on a house to distribute
        const move: AwaleMove = AwaleMove.ZERO;

        // Then the move should be performed
        await testUtils.expectMoveSuccess('#click_0_1', move);
        // and the moved spaces should be shown
        // Initial element
        testUtils.expectElementToHaveClasses('#click_0_1', ['base', 'moved-stroke', 'last-move-stroke', 'player0-fill']);
        // The space between initial coord and captured coord
        testUtils.expectElementToHaveClasses('#click_0_0', ['base', 'moved-stroke', 'player1-fill']);
        // as well as the captured spaces
        testUtils.expectElementToHaveClasses('#click_1_0', ['base', 'moved-stroke', 'captured-fill']);
    }));
    it('should show moved house after a move', fakeAsync(async() => {
        // Given any state (initial here by default)

        // When player performs a move
        const move: AwaleMove = AwaleMove.FIVE;
        await testUtils.expectMoveSuccess('#click_5_1', move);

        // Then the moved spaces should be shown
        // Initial element
        testUtils.expectElementToHaveClasses('#click_5_1', ['base', 'moved-stroke', 'last-move-stroke', 'player0-fill']);
        // The filled spaces
        testUtils.expectElementToHaveClasses('#click_4_1', ['base', 'moved-stroke', 'player0-fill']);
        testUtils.expectElementToHaveClasses('#click_3_1', ['base', 'moved-stroke', 'player0-fill']);
        testUtils.expectElementToHaveClasses('#click_2_1', ['base', 'moved-stroke', 'player0-fill']);
        testUtils.expectElementToHaveClasses('#click_1_1', ['base', 'moved-stroke', 'player0-fill']);
    }));
    it('should tell to user empty house cannot be moved', fakeAsync(async() => {
        // Given a state with an empty house
        const board: Table<number> = [
            [0, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 4],
        ];
        const state: AwaleState = new AwaleState(board, 1, [0, 0]);
        testUtils.setupState(state);

        // When clicking on the empty house
        const move: AwaleMove = AwaleMove.ZERO;

        // Then it should fail
        const reason: string = AwaleFailure.MUST_CHOOSE_NON_EMPTY_HOUSE();
        await testUtils.expectMoveFailure('#click_0_0', reason, move);
    }));
    it(`should tell to user opponent's house cannot be moved`, fakeAsync(async() => {
        // Given a state
        const board: Table<number> = [
            [4, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 4],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        testUtils.setupState(state);

        // When clicking on a house of the opponent
        // Then it should fail
        await testUtils.expectClickFailure('#click_0_0', AwaleFailure.CANNOT_DISTRIBUTE_FROM_OPPONENT_HOME());
    }));
    it('should display filled-then-captured capture', fakeAsync(async() => {
        // Given a board where some empty space could filled then captured
        const board: Table<number> = [
            [11, 4, 4, 4, 4, 0],
            [17, 4, 4, 4, 4, 4],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        testUtils.setupState(state);

        // When doing the capturing move
        const move: AwaleMove = AwaleMove.ZERO;
        await testUtils.expectMoveSuccess('#click_0_1', move);

        // Then the space in question should be marked as "captured"
        const content: DebugElement = testUtils.findElement('#captured_5_0');
        expect(content.nativeElement.innerHTML).toBe(' -2 ');
        testUtils.expectElementToHaveClass('#click_5_0', 'captured-fill');
    }));
    it('should display mansoon capture', fakeAsync(async() => {
        // Given a board where the player is about to give his last seed to the opponent
        const board: Table<number> = [
            [0, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 4],
        ];
        const state: AwaleState = new AwaleState(board, 121, [0, 0]);
        testUtils.setupState(state);

        // When doing the capturing move
        const move: AwaleMove = AwaleMove.FIVE;
        await testUtils.expectMoveSuccess('#click_5_0', move);

        // Then the space in question should be marked as "captured"
        const content: DebugElement = testUtils.findElement('#captured_5_1');
        expect(content.nativeElement.innerHTML).toBe(' -5 ');
        testUtils.expectElementToHaveClass('#click_5_1', 'captured-fill');
    }));
});
