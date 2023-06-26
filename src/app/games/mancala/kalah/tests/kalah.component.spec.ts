/* eslint-disable max-lines-per-function */
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { KalahComponent } from '../kalah.component';
import { fakeAsync } from '@angular/core/testing';
import { KalahMove } from '../KalahMove';
import { MancalaMove } from '../../commons/MancalaMove';
import { DebugElement } from '@angular/core';
import { MancalaState } from '../../commons/MancalaState';
import { Table } from 'src/app/utils/ArrayUtils';

describe('KalahComponent', () => {

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
    it('should show constructed move during multi-distribution move', fakeAsync(async() => {
        // Given any board where first distribution has been done
        // When doing the first part of the move
        await testUtils.expectClickSuccess('#click_3_1');
        // Then it shoould already been displayed
        const content: DebugElement = testUtils.findElement('#number_2_1');
        expect(content.nativeElement.innerHTML).toBe(' 5 ');
    }));
    it('should allow double distribution move', fakeAsync(async() => {
        // Given any board where first distribution has been done
        await testUtils.expectClickSuccess('#click_3_1');
        // When doing double distribution move
        const move: KalahMove = new KalahMove(MancalaMove.THREE, [MancalaMove.ZERO]);
        // Then it should be a success
        await testUtils.expectMoveSuccess('#click_0_1', move);
    }));
    it('should allow triple distribution move', fakeAsync(async() => {
        // Given a state where multiple capture are possible
        const state: MancalaState = new MancalaState([
            [6, 1, 7, 6, 1, 7],
            [0, 1, 6, 2, 0, 5],
        ], 3, [4, 2]);
        await testUtils.setupState(state);

        // When doing the complex move
        const nonFinalMove: KalahMove = new KalahMove(MancalaMove.ZERO, [MancalaMove.FOUR]);
        const move: KalahMove = new KalahMove(MancalaMove.ZERO, [MancalaMove.FOUR, MancalaMove.ONE]);
        for (const subMove of nonFinalMove) {
            await testUtils.expectClickSuccess('#click_' + subMove.x + '_0');
        }
        // Then the move should be legal
        await testUtils.expectMoveSuccess('#click_1_0', move);
    }));
    // TODO: I don't get a thing, what did previous player do ?
    it('should display filled-then-captured capture', fakeAsync(async() => {
        // Given a board where some empty space could filled then captured
        const board: Table<number> = [
            [0, 0, 0, 0, 0, 0],
            [8, 0, 0, 0, 0, 0],
        ];
        const state: MancalaState = new MancalaState(board, 0, [0, 0]);
        await testUtils.setupState(state);

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
        await testUtils.setupState(state);

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
    it('should display capture', fakeAsync(async() => {
        // Given a board where a capture is doable
        const board: Table<number> = [
            [0, 6, 6, 5, 5, 5],
            [6, 0, 5, 0, 4, 4],
        ];
        const state: MancalaState = new MancalaState(board, 2, [2, 0]);
        await testUtils.setupState(state);

        // When clicking on the house to distribute to capture
        const move: KalahMove = new KalahMove(MancalaMove.FIVE);
        await testUtils.expectMoveSuccess('#click_5_1', move);

        // Then the move should be legal and the capture be done
        let content: DebugElement = testUtils.findElement('#captured_1_0');
        expect(content.nativeElement.innerHTML).toBe(' -6 ');
        testUtils.expectElementToHaveClass('#click_1_0', 'captured-fill');
        content = testUtils.findElement('#captured_1_1');
        expect(content.nativeElement.innerHTML).toBe(' -1 ');
        testUtils.expectElementToHaveClass('#click_1_1', 'captured-fill');
    }));
    it('should get back to original board when taking back move', fakeAsync(async() => {
        // Given a board where a first move has been done
        const move: KalahMove = new KalahMove(MancalaMove.ZERO);
        await testUtils.expectMoveSuccess('#click_0_1', move);

        // When taking back
        await testUtils.expectInterfaceClickSuccess('#takeBack');

        // Then the board should be restored
        const element: DebugElement = testUtils.findElement('#number_0_1');
        expect(element.nativeElement.innerHTML).toBe(' 4 ');
    }));
    // TODO: THIS.LAST SHOULD EXIST EH, WHERE IS THE LAST MOVE ON SINGLE MOVES ?
    // TODO: refactor to have most test in common
    //      TODO: first check if it's something we want to, since move here have more click ?
    // Note that we have the option to make it simple with setupState(with some last move)

    // TODO: FIX: when on 1v1 capture are done correctly and highlighted
    //            against the AI level 1, capture are partially done (landing stone not taken) and not highlighted
});
