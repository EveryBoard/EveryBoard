/* eslint-disable max-lines-per-function */
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { KalahComponent } from '../kalah.component';
import { fakeAsync, tick } from '@angular/core/testing';
import { KalahMove } from '../KalahMove';
import { MancalaDistribution } from '../../commons/MancalaMove';
import { DebugElement } from '@angular/core';
import { MancalaState } from '../../commons/MancalaState';
import { Table } from 'src/app/utils/ArrayUtils';
import { DoMancalaComponentTests } from '../../commons/GenericMancalaComponentTest.spec';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';

describe('KalahComponent', () => {

    let testUtils: ComponentTestUtils<KalahComponent>;

    async function expectMoveSuccess(click: string, move: KalahMove): Promise<void> {
        const component: KalahComponent = testUtils.getComponent();
        const state: MancalaState = component.constructedState;
        const playerY: number = component.getCurrentOpponent().value;
        const lastDistribution: MancalaDistribution = move.subMoves[move.subMoves.length - 1];
        let lastDistributionSeedNumber: number = state.getPieceAtXY(lastDistribution.x, playerY);
        if (lastDistributionSeedNumber > 12) {
            lastDistributionSeedNumber++; // it'll take 200ms skipping the initial house
        }
        const moveDuration: number = (lastDistributionSeedNumber + 1) * 200; // The time to move the seeds
        await testUtils.expectMoveSuccess(click, move, undefined, undefined, moveDuration);
    }
    async function expectClickSuccess(coord: Coord): Promise<void> {
        const pieceInHouse: number = testUtils.getComponent().constructedState.getPieceAt(coord);
        const timeToWait: number = (pieceInHouse + 1) * 200;
        const click: string = '#click_' + coord.x + '_' + coord.y;
        await testUtils.expectClickSuccess(click);
        tick(timeToWait);
    }
    function checkKalahSecondaryMessage(text?: string): void {
        if (text === undefined) {
            const content: DebugElement = testUtils.findElement('#secondary_message_-1_-1');
            expect(content).toBeNull();
        } else {
            const content: DebugElement = testUtils.findElement('#secondary_message_-1_-1');
            expect(content.nativeElement.innerHTML).toBe(text);
        }
    }
    // TODO: put selectAIPlayer, choosingAIOrHuman, choosingAILevel in LGWC/testUtils
    async function selectAIPlayer(player: Player): Promise<void> {
        await choosingAIOrHuman(player, 'AI');
        await choosingAILevel(player);
    }
    async function choosingAIOrHuman(player: Player, aiOrHuman: 'AI' | 'human'): Promise<void> {
        const playerSelect: string = player === Player.ZERO ? '#playerZeroSelect' : '#playerOneSelect';
        const selectAI: HTMLSelectElement = testUtils.findElement(playerSelect).nativeElement;
        selectAI.value = aiOrHuman === 'AI' ? selectAI.options[1].value : selectAI.options[0].value;
        selectAI.dispatchEvent(new Event('change'));
        testUtils.detectChanges();
        await testUtils.fixture.whenStable();
    }
    async function choosingAILevel(player: Player): Promise<void> {
        const aiDepthSelect: string = player === Player.ZERO ? '#aiZeroDepthSelect' : '#aiOneDepthSelect';
        const selectDepth: HTMLSelectElement = testUtils.findElement(aiDepthSelect).nativeElement;
        selectDepth.value = selectDepth.options[1].value;
        selectDepth.dispatchEvent(new Event('change'));
        testUtils.detectChanges();
        const aiDepth: string = selectDepth.options[selectDepth.selectedIndex].label;
        expect(aiDepth).toBe('Level 1');
        testUtils.detectChanges();
    }
    DoMancalaComponentTests({
        component: KalahComponent,
        gameName: 'Kalah',

        mansoonableState: new MancalaState([
            [0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 1],
        ], 100, [0, 0]),
        mansooningMove: KalahMove.of(MancalaDistribution.FIVE),
        mansoonedCoords: [{ x: 4, y: 1, content: ' -1 ' }, { x: 0, y: 1, content: ' -1 ' }],

        capturableState: new MancalaState([
            [0, 6, 6, 5, 5, 5],
            [6, 0, 5, 0, 4, 4],
        ], 2, [0, 0]),
        capturingMove: KalahMove.of(MancalaDistribution.FIVE),
        capturedCoords: [{ x: 1, y: 0, content: ' -6 ' }, { x: 1, y: 1, content: ' -1 ' }],

        fillableThenCapturableState: new MancalaState([
            [0, 0, 0, 0, 0, 0],
            [8, 0, 0, 0, 0, 0],
        ], 0, [0, 0]),
        fillingThenCapturingMove: KalahMove.of(MancalaDistribution.ZERO),
        filledThenCapturedCoords: [{ x: 5, y: 0, content: ' -1 ' }, { x: 5, y: 1, content: ' -1 ' }],
    });
    describe('Kalah-Specific Tests', () => {
        beforeEach(fakeAsync(async() => {
            testUtils = await ComponentTestUtils.forGame<KalahComponent>('Kalah');
        }));
        describe('Animations', () => {
            it('should feed the kalah during animation', fakeAsync(async() => {
                // Given a board where a distribution pass by the kalah
                const element: DebugElement = testUtils.findElement('#click_1_1');
                expect(element).withContext('Element "#click_1_1" should exist').toBeTruthy();
                element.triggerEventHandler('click', null);
                tick(200);
                checkKalahSecondaryMessage();

                // When passing right after the last house in player's territory
                tick(200);

                // Then the next fed house should be the kalah
                checkKalahSecondaryMessage(' +1 ');
                testUtils.expectElementToHaveClass('#circle_-1_-1', 'moved-stroke');
                tick(600);
            }));
            it('should feed the kalah twice during animation of double-distribution-move', fakeAsync(async() => {
                // Given a board where a first distribution has been done and the second started
                await expectClickSuccess(new Coord(3, 1));
                const element: DebugElement = testUtils.findElement('#click_0_1');
                element.triggerEventHandler('click', null);
                checkKalahSecondaryMessage(' +1 ');

                // When waiting for the first sub-move (in kalah) to happend
                tick(200);

                // Then the kalah should be fed a second time
                checkKalahSecondaryMessage(' +2 ');
                tick(1000);
            }));
        });
        it('should show constructed move during multi-distribution move', fakeAsync(async() => {
            // Given any board where first distribution has been done

            // WhencheckKalahSecondaryMessage doing the first part of the move
            await expectClickSuccess(new Coord(3, 1));

            // Then it should already been displayed
            const content: DebugElement = testUtils.findElement('#number_2_1');
            expect(content.nativeElement.innerHTML).toBe(' 5 ');
            // and the chosen coord should be visible already
            testUtils.expectElementToHaveClasses('#circle_3_1', ['base', 'moved-stroke', 'last-move-stroke', 'player0-fill']);
            // The filled spaces
            testUtils.expectElementToHaveClasses('#circle_2_1', ['base', 'moved-stroke', 'player0-fill']);
            testUtils.expectElementToHaveClasses('#circle_1_1', ['base', 'moved-stroke', 'player0-fill']);
            testUtils.expectElementToHaveClasses('#circle_0_1', ['base', 'moved-stroke', 'player0-fill']);
        }));
        it('should allow double distribution move', fakeAsync(async() => {
            // Given any board where first distribution has been done
            await expectClickSuccess(new Coord(3, 1));
            // When doing double distribution move
            const move: KalahMove = KalahMove.of(MancalaDistribution.THREE, [MancalaDistribution.ZERO]);
            // Then it should be a success
            await expectMoveSuccess('#click_0_1', move);
        }));
        it('should allow triple distribution move', fakeAsync(async() => {
            // Given a state where multiple capture are possible
            const state: MancalaState = new MancalaState([
                [6, 1, 7, 6, 1, 7],
                [2, 1, 6, 2, 2, 5],
            ], 3, [4, 2]);
            await testUtils.setupState(state);

            // When doing the complex move
            await expectClickSuccess(new Coord(0, 0));
            await expectClickSuccess(new Coord(4, 0));
            const move: KalahMove = KalahMove.of(MancalaDistribution.ZERO,
                                                 [MancalaDistribution.FOUR, MancalaDistribution.ONE]);

            // Then the move should be legal
            await expectMoveSuccess('#click_1_0', move);
        }));
        it('should allow triple distribution move (2)', fakeAsync(async() => {
            // Given a state where multiple capture are possible
            const state: MancalaState = new MancalaState([
                [5, 0, 6, 6, 0, 6],
                [0, 5, 5, 1, 5, 5],
            ], 2, [2, 2]);
            await testUtils.setupState(state);

            // When doing the complex move
            await expectClickSuccess(new Coord(4, 1));
            await expectClickSuccess(new Coord(0, 1));
            const move: KalahMove = KalahMove.of(MancalaDistribution.FOUR,
                                                 [MancalaDistribution.ZERO, MancalaDistribution.FIVE]);

            // Then the move should be legal
            await expectMoveSuccess('#click_5_1', move);
        }));
        it('should hide previous capture when starting multiple distribution move', fakeAsync(async() => {
            // Given a board where a capture has been done
            const previousBoard: Table<number> = [
                [4, 4, 4, 4, 4, 4],
                [0, 0, 0, 2, 0, 0],
            ];
            const previousState: MancalaState = new MancalaState(previousBoard, 4, [0, 0]);
            const board: Table<number> = [
                [4, 0, 4, 4, 4, 4],
                [0, 0, 1, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 5, [5, 0]);
            const move: KalahMove = KalahMove.of(MancalaDistribution.THREE);
            await testUtils.setupState(state, previousState, move);

            // When starting a multiple-capture move
            await expectClickSuccess(new Coord(2, 0));

            // Then the capture should no longer be displayed
            testUtils.expectElementNotToHaveClass('#circle_1_1', 'captured-fill');
            testUtils.expectElementNotToHaveClass('#circle_1_0', 'captured-fill');
        }));
        it('should get back to original board when taking back move', fakeAsync(async() => {
            // Given a board where a first move has been done
            const move: KalahMove = KalahMove.of(MancalaDistribution.ZERO);
            await expectMoveSuccess('#click_0_1', move);

            // When taking back
            await testUtils.expectInterfaceClickSuccess('#takeBack');

            // Then the board should be restored
            const element: DebugElement = testUtils.findElement('#number_0_1');
            expect(element.nativeElement.innerHTML).toBe(' 4 ');
        }));
        it('should hide number of seed dropped in kalah after AI move', fakeAsync(async() => {
            // Given a move Player.ZERO only choice is dropping a seed in the Kalah
            const state: MancalaState = new MancalaState([
                [0, 0, 0, 0, 0, 0],
                [4, 0, 0, 0, 0, 0],
            ], 0, [0, 0]);
            await testUtils.setupState(state);

            // When giving turn to AI to play and waiting for move
            await selectAIPlayer(Player.ZERO);
            tick(2000); // 1000ms for AI to take action + 1000 for the distribution

            // Then the " +1 " in Kalah secondary message should have disappeared
            checkKalahSecondaryMessage();
        }));
    });
});
