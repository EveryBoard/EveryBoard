/* eslint-disable max-lines-per-function */
import { AwaleComponent } from '../awale.component';
import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwaleState } from 'src/app/games/awale/AwaleState';
import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { AwaleFailure } from '../AwaleFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { DebugElement } from '@angular/core';

fdescribe('AwaleComponent', () => {

    let testUtils: ComponentTestUtils<AwaleComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<AwaleComponent>('Awale');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    fit('should accept simple move for player zero, show captured and moved', fakeAsync(async() => {
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
        await testUtils.expectMoveSuccess('#click_0_1', move, undefined, [0, 0]);
        const awaleComponent: AwaleComponent = testUtils.getComponent();
        // and the moved spaces should be shown
        expect(awaleComponent.getSquareClasses(0, 1))
            .withContext('initial coord should be moved and highlighted')
            .toEqual(['moved', 'highlighted']);
        expect(awaleComponent.getSquareClasses(0, 0))
            .withContext('space between initial coord and captured coord should be moved')
            .toEqual(['moved']);
        // as well as the captured spaces
        expect(awaleComponent.getSquareClasses(1, 0))
            .withContext('Captured coord should be marked as captured')
            .toEqual(['captured']);
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
        // Then it should be rejected
        const move: AwaleMove = AwaleMove.ZERO;
        await testUtils.expectMoveFailure('#click_0_0',
                                          AwaleFailure.MUST_CHOOSE_NON_EMPTY_HOUSE(),
                                          move, undefined, [0, 0]);
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
        // Then it should be rejected
        await testUtils.expectClickFailure('#click_0_0', AwaleFailure.CANNOT_DISTRIBUTE_FROM_OPPONENT_HOME());
    }));
    it('should display filled-then-caputred capture', fakeAsync(async() => {
        // Given a board where some empty space could filled then captured
        const board: Table<number> = [
            [4, 4, 4, 4, 4, 0],
            [4, 4, 4, 4, 4, 12],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        testUtils.setupState(state);

        // When doing the capturing move
        const move: AwaleMove = AwaleMove.FIVE;
        await testUtils.expectMoveSuccess('#click_5_1', move);

        // Then the space in question should be marked as "captured"
        const content: DebugElement = testUtils.findElement('#number_5_0');
        expect(content.nativeElement.innerHtml).toBe('2');
        testUtils.expectElementToHaveClass('#click_5_0', 'captured');

    }));
});
