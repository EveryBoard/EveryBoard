/* eslint-disable max-lines-per-function */
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { KalahComponent } from '../kalah.component';
import { fakeAsync } from '@angular/core/testing';
import { KalahMove } from '../KalahMove';
import { MancalaMove } from '../../MancalaMove';
import { DebugElement } from '@angular/core';
import { MancalaState } from '../../MancalaState';
import { Table } from 'src/app/utils/ArrayUtils';

fdescribe('KalahComponent', () => {

    let testUtils: ComponentTestUtils<KalahComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<KalahComponent>('Kalah');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    it('should allow single distribution move', fakeAsync(async() => {
        // Given any board
        // When doing single distribution move
        const move: KalahMove = new KalahMove(MancalaMove.ZERO);
        // Then it should be a success
        await testUtils.expectMoveSuccess('#click_0_1', move);
    }));
    fit('should show constructed move during multi-distribution move', fakeAsync(async() => {
        // Given any board where first distribution has been done
        // When doing the first part of the move
        await testUtils.expectClickSuccess('#click_3_1');
        // Then it shoould already been displayed
        const content: DebugElement = testUtils.findElement('#click_2_1');
        expect(content.nativeElement.innerHTML).toBe('5');
    }));
    it('should allow double distribution move', fakeAsync(async() => {
        // Given any board where first distribution has been done
        await testUtils.expectClickSuccess('#click_3_1');
        // When doing double distribution move
        const move: KalahMove = new KalahMove(MancalaMove.THREE, [MancalaMove.ZERO]);
        // Then it should be a success
        await testUtils.expectMoveSuccess('#click_0_1', move);
    }));
    it('should allow triple distribution move', () => {
        // Given
        // When
        // Then
        // RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should display filled-then-captured capture', fakeAsync(async() => {
        // Given a board where some empty space could filled then captured
        const board: Table<number> = [
            [0, 0, 0, 0, 0, 0],
            [8, 0, 0, 0, 0, 0],
        ];
        const state: MancalaState = new MancalaState(board, 0, [0, 0]);
        testUtils.setupState(state);

        // When doing the capturing move
        const move: KalahMove = new KalahMove(MancalaMove.ZERO);
        await testUtils.expectMoveSuccess('#click_0_1', move);

        // Then the spaces in question should be marked as "captured"
        let content: DebugElement = testUtils.findElement('#captured_5_0');
        expect(content.nativeElement.innerHTML).toBe(' -1 ');
        testUtils.expectElementToHaveClass('#click_5_0', 'captured-fill');
        content = testUtils.findElement('#captured_5_1');
        expect(content.nativeElement.innerHTML).toBe(' -1 ');
        testUtils.expectElementToHaveClass('#click_5_1', 'captured-fill');
    }));
    it('should display mansoon capture', fakeAsync(async() => {
        // Given a board where the player is about to do a starving move on purpose
        const board: Table<number> = [
            [0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 1],
        ];
        const state: MancalaState = new MancalaState(board, 100, [0, 0]);
        testUtils.setupState(state);

        // When doing the capturing move
        const move: KalahMove = new KalahMove(MancalaMove.FIVE);
        await testUtils.expectMoveSuccess('#click_5_1', move);

        // Then the space in question should be marked as "captured"
        let content: DebugElement = testUtils.findElement('#captured_4_1');
        expect(content.nativeElement.innerHTML).toBe(' -1 ');
        testUtils.expectElementToHaveClass('#click_4_1', 'captured-fill');
        content = testUtils.findElement('#captured_0_1');
        expect(content.nativeElement.innerHTML).toBe(' -1 ');
        testUtils.expectElementToHaveClass('#click_0_1', 'captured-fill');
    }));
    // TODO: refactor to have most test in common
    //      TODO: first check if it's something we want to, since move here have more click ?
    // Note that we have the option to make it simple with setupState(with some last move)

    // TODO: FIX: when on 1v1 capture are done correctly and highlighted
    //            against the AI level 1, capture are partially done (landing stone not taken) and not highlighted
});
