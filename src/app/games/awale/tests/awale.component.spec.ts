/* eslint-disable max-lines-per-function */
import { AwaleComponent } from '../awale.component';
import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwaleState } from 'src/app/games/awale/AwaleState';
import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { AwaleFailure } from '../AwaleFailure';
import { Table } from 'src/app/utils/ArrayUtils';

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
            [4, 4, 4, 4, 4, 2],
            [4, 4, 4, 4, 1, 4],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        testUtils.setupState(state);

        // When player zero clicks on a house to distribute
        const move: AwaleMove = AwaleMove.FIVE;

        // Then the move should be performed
        await testUtils.expectMoveSuccess('#click_5_0', move, undefined, [0, 0]);
        const awaleComponent: AwaleComponent = testUtils.getComponent();
        // and the moved spaces should be shown
        expect(awaleComponent.getSquareClasses(5, 0)).toEqual(['moved-fill', 'last-move-stroke']);
        expect(awaleComponent.getSquareClasses(5, 1)).toEqual(['moved-fill']);
        // as well as the captured spaces
        expect(awaleComponent.getSquareClasses(4, 1)).toEqual(['captured-fill']);
    }));
    it('should tell to user empty house cannot be moved', fakeAsync(async() => {
        // Given a state with an empty house
        const board: Table<number> = [
            [0, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 4],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
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
            [0, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 4],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        testUtils.setupState(state);

        // When clicking on a house of the opponent
        // Then it should be rejected
        await testUtils.expectClickFailure('#click_0_1', AwaleFailure.CANNOT_DISTRIBUTE_FROM_OPPONENT_HOME());
    }));
});
