/* eslint-disable max-lines-per-function */
import { AwaleComponent } from '../awale.component';
import { MancalaMove } from 'src/app/games/mancala/commons/MancalaMove';
import { MancalaState } from 'src/app/games/mancala/commons/MancalaState';
import { fakeAsync, tick } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { MancalaFailure } from '../../commons/MancalaFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { DebugElement } from '@angular/core';

fdescribe('AwaleComponent', () => {

    let testUtils: ComponentTestUtils<AwaleComponent>;

    async function expectMoveSuccess(click: string, move: MancalaMove): Promise<void> {
        const component: AwaleComponent = testUtils.getComponent();
        const playerY: number = component.getCurrentPlayer().getOpponent().value;
        const nbSeeds: number = component.board[playerY][move.x];
        await testUtils.expectMoveSuccess(click, move);
        // The emptying will take 200 ms
        // Each seed will take 200ms to be sown
        // The capture will take 200ms
        tick((nbSeeds + 2) * 200);
    }
    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<AwaleComponent>('Awale');
    }));
    describe('Commons Mancala Tests', () => {
        describe('Move Animation', () => {
            it('should immediately highlight last move clicked house', fakeAsync(async() => {
                // Given any board
                const move: MancalaMove = MancalaMove.FIVE;

                // When waiting choosing to distribute house 5
                await testUtils.expectMoveSuccess('#click_5_1', move);

                // Then no seed should be distributed
                let content: DebugElement = testUtils.findElement('#number_4_1');
                expect(content.nativeElement.innerHTML).toBe(' 4 ');
                testUtils.expectElementToHaveClasses('#circle_4_1', ['base', 'player0-fill']);

                // And the clicked space should be highlighted
                content = testUtils.findElement('#number_5_1');
                expect(content.nativeElement.innerHTML).toBe(' 0 ');
                testUtils.expectElementToHaveClasses('#circle_5_1', ['base', 'moved-stroke', 'last-move-stroke', 'player0-fill']);

                // Finish the distribution
                tick(1000);
            }));
            it('should show right after the first seed being drop', fakeAsync(async() => {
                // Given any board on which several seeds have been chosen to be distributed
                const move: MancalaMove = MancalaMove.FIVE;
                await testUtils.expectMoveSuccess('#click_5_1', move);

                // When waiting 2N ms
                tick(400);

                // Then only the first seed should be distributed
                const content: DebugElement = testUtils.findElement('#number_4_1');
                expect(content.nativeElement.innerHTML).toBe(' 5 ');
                testUtils.expectElementToHaveClasses('#circle_4_1', ['base', 'moved-stroke', 'player0-fill']);

                // Finish the distribution
                tick(600);
            }));
            it('should take N ms by seed to distribute + N ms', fakeAsync(async() => {
                // Given any board
                const move: MancalaMove = MancalaMove.FIVE;

                // When distributing a house
                await testUtils.expectMoveSuccess('#click_5_1', move);

                // Then it should take 200ms by seed to finish distribute it
                tick((4 + 1) * 200);
            }));
        });
        it('should create', () => {
            testUtils.expectToBeCreated();
        });
        it('should allow basic move', fakeAsync(async() => {
            // Given any board
            // When doing single distribution move
            const move: MancalaMove = MancalaMove.ZERO;
            // Then it should be a success
            await expectMoveSuccess('#click_0_1', move);
        }));
        it('should display last move after basic move', fakeAsync(async() => {
            // TODO FOR REVIEW: when putting it in common, should I:
            //      a. deduce the list of filledHouse via the rules
            //      b. have a parameter of some MancalaTestConfig hard-code it ?
            // Given any state (initial here by default)

            // When player performs a move
            const move: MancalaMove = MancalaMove.FIVE;
            await expectMoveSuccess('#click_5_1', move);

            // Then the moved spaces should be shown
            // Initial element
            testUtils.expectElementToHaveClasses('#circle_5_1', ['base', 'moved-stroke', 'last-move-stroke', 'player0-fill']);
            // The filled spaces
            testUtils.expectElementToHaveClasses('#circle_4_1', ['base', 'moved-stroke', 'player0-fill']);
            testUtils.expectElementToHaveClasses('#circle_3_1', ['base', 'moved-stroke', 'player0-fill']);
            testUtils.expectElementToHaveClasses('#circle_2_1', ['base', 'moved-stroke', 'player0-fill']);
            testUtils.expectElementToHaveClasses('#circle_1_1', ['base', 'moved-stroke', 'player0-fill']);
        }));
        it('should hide last move when taking move back', fakeAsync(async() => {
            // Given a board with a last move
            const move: MancalaMove = MancalaMove.FIVE;
            await expectMoveSuccess('#click_5_1', move);

            // When taking back
            await testUtils.expectInterfaceClickSuccess('#takeBack');

            // Then the last-move highlight should be removed
            testUtils.expectElementToHaveClasses('#circle_5_1', ['base', 'player0-fill']);
            // And the moved highlight should be removed
            testUtils.expectElementToHaveClasses('#circle_4_1', ['base', 'player0-fill']);
            testUtils.expectElementToHaveClasses('#circle_3_1', ['base', 'player0-fill']);
            testUtils.expectElementToHaveClasses('#circle_2_1', ['base', 'player0-fill']);
            testUtils.expectElementToHaveClasses('#circle_1_1', ['base', 'player0-fill']);
        }));
    });
    it('should accept simple move for player zero, show captured and moved', fakeAsync(async() => {
        // Given a state where player zero can capture
        const board: Table<number> = [
            [4, 1, 4, 4, 4, 4],
            [2, 4, 4, 4, 4, 4],
        ];
        const state: MancalaState = new MancalaState(board, 0, [0, 0]);
        await testUtils.setupState(state);

        // When player zero clicks on a house to distribute
        const move: MancalaMove = MancalaMove.ZERO;

        // Then the move should be performed
        await expectMoveSuccess('#click_0_1', move);
        // and the moved spaces should be shown
        // Initial element
        testUtils.expectElementToHaveClasses('#circle_0_1', ['base', 'moved-stroke', 'last-move-stroke', 'player0-fill']);
        // The space between initial coord and captured coord
        testUtils.expectElementToHaveClasses('#circle_0_0', ['base', 'moved-stroke', 'player1-fill']);
        // as well as the captured spaces
        testUtils.expectElementToHaveClasses('#circle_1_0', ['base', 'moved-stroke', 'captured-fill']);
    }));
    it('should show moved house after a move', fakeAsync(async() => { // TODO: put in common to the others
        // Given any state (initial here by default)

        // When player performs a move
        const move: MancalaMove = MancalaMove.FIVE;
        await expectMoveSuccess('#click_5_1', move);

        // Then the moved spaces should be shown
        // Initial element
        testUtils.expectElementToHaveClasses('#circle_5_1', ['base', 'moved-stroke', 'last-move-stroke', 'player0-fill']);
        // The filled spaces
        testUtils.expectElementToHaveClasses('#circle_4_1', ['base', 'moved-stroke', 'player0-fill']);
        testUtils.expectElementToHaveClasses('#circle_3_1', ['base', 'moved-stroke', 'player0-fill']);
        testUtils.expectElementToHaveClasses('#circle_2_1', ['base', 'moved-stroke', 'player0-fill']);
        testUtils.expectElementToHaveClasses('#circle_1_1', ['base', 'moved-stroke', 'player0-fill']);
    }));
    it('should tell to user empty house cannot be moved', fakeAsync(async() => {
        // Given a state with an empty house
        const board: Table<number> = [
            [0, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 4],
        ];
        const state: MancalaState = new MancalaState(board, 1, [0, 0]);
        await testUtils.setupState(state);

        // When clicking on the empty house
        const move: MancalaMove = MancalaMove.ZERO;

        // Then it should fail
        const reason: string = MancalaFailure.MUST_CHOOSE_NON_EMPTY_HOUSE();
        await testUtils.expectMoveFailure('#click_0_0', reason, move);
    }));
    it(`should tell to user opponent's house cannot be moved`, fakeAsync(async() => {
        // Given a state
        const board: Table<number> = [
            [4, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 4],
        ];
        const state: MancalaState = new MancalaState(board, 0, [0, 0]);
        await testUtils.setupState(state);

        // When clicking on a house of the opponent
        // Then it should fail
        await testUtils.expectClickFailure('#click_0_0', MancalaFailure.CANNOT_DISTRIBUTE_FROM_OPPONENT_HOME());
    }));
    it('should display filled-then-captured capture', fakeAsync(async() => {
        // Given a board where some empty space could filled then captured
        const board: Table<number> = [
            [11, 4, 4, 4, 4, 0],
            [17, 4, 4, 4, 4, 4],
        ];
        const state: MancalaState = new MancalaState(board, 0, [0, 0]);
        await testUtils.setupState(state);

        // When doing the capturing move
        const move: MancalaMove = MancalaMove.ZERO;
        await expectMoveSuccess('#click_0_1', move);

        // Then the space in question should be marked as "captured"
        const content: DebugElement = testUtils.findElement('#secondary_message_5_0');
        expect(content.nativeElement.innerHTML).toBe(' -2 ');
        testUtils.expectElementToHaveClass('#circle_5_0', 'captured-fill');
    }));
    it('should display mansoon capture', fakeAsync(async() => {
        // Given a board where the player is about to give his last seed to the opponent
        const board: Table<number> = [
            [0, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 4],
        ];
        const state: MancalaState = new MancalaState(board, 121, [0, 0]);
        await testUtils.setupState(state);

        // When doing the capturing move
        const move: MancalaMove = MancalaMove.FIVE;
        await expectMoveSuccess('#click_5_0', move);

        // Then the space in question should be marked as "captured"
        const content: DebugElement = testUtils.findElement('#secondary_message_5_1');
        expect(content.nativeElement.innerHTML).toBe(' -5 ');
        testUtils.expectElementToHaveClass('#circle_5_1', 'captured-fill');
    }));
});
