
/* eslint-disable max-lines-per-function */
import { DebugElement, Type } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { MancalaComponent } from './MancalaComponent';
import { MancalaRules } from './MancalaRules';
import { MancalaDistribution, MancalaMove } from './MancalaMove';
import { MancalaState } from './MancalaState';
import { Cell, Table } from 'src/app/utils/ArrayUtils';
import { MancalaFailure } from './MancalaFailure';


export class MancalaTestEntries<C extends MancalaComponent<R, M>,
                                R extends MancalaRules<M>,
                                M extends MancalaMove>
{
    component: Type<C>; // KalahComponent, AwaleComponent, etc
    gameName: string; // 'Kalah', 'Awale', etc

    mansoonableState: MancalaState;
    mansooningMove: M; // Must be a move that mansoon 'mansoonableState'
    mansoonedCoords: Cell<string>[]; // The houses refs that'll get mansooned by mansooningMove

    capturableState: MancalaState;
    capturingMove: M; // Must be a move that capture 'capturableState',
    capturedCoords: Cell<string>[]; // The houses refs that'll get captured by capturingMove
}
export function DoMancalaComponentTests<C extends MancalaComponent<R, M>,
                                        R extends MancalaRules<M>,
                                        M extends MancalaMove>(entries: MancalaTestEntries<C, R, M>)
: void
{
    let testUtils: ComponentTestUtils<C>;
    describe(entries.gameName + ' component generic tests', () => {

        async function expectMoveSuccess(click: string, move: M): Promise<void> {
            const component: C = testUtils.getComponent();
            const state: MancalaState = component.constructedState.get();
            const playerY: number = component.getCurrentOpponent().value;
            const lastDistribution: MancalaDistribution = move.subMoves[move.subMoves.length - 1];
            let lastDistributionSeedNumber: number = state.getPieceAtXY(lastDistribution.x, playerY);
            if (lastDistributionSeedNumber > 12) {
                lastDistributionSeedNumber++; // it'll take 200ms skipping the initial house
            }
            const moveDuration: number = (lastDistributionSeedNumber + 1) * 200; // The time to move the seeds
            await testUtils.expectMoveSuccess(click, move, undefined, undefined, moveDuration);
        }
        function expectToBeCaptured(cell: Cell<string>): void {
            const coordSuffix: string = cell.x + '_' + cell.y;
            const content: DebugElement = testUtils.findElement('#secondary_message_' + coordSuffix);
            expect(content.nativeElement.innerHTML).toBe(cell.content);
            testUtils.expectElementToHaveClasses('#circle_' + coordSuffix, ['base', 'moved-stroke', 'captured-fill']);
        }
        beforeEach(fakeAsync(async() => {
            testUtils = await ComponentTestUtils.forGame<C>(entries.gameName);
        }));
        it('should create', () => {
            testUtils.expectToBeCreated();
        });
        it('should allow basic move', fakeAsync(async() => {
            // Given any board
            // When doing single distribution move
            const move: M = testUtils.getComponent().generateMove(0);
            // Then it should be a success
            await expectMoveSuccess('#click_0_1', move);
        }));
        it('should allow two move in a row', fakeAsync(async() => {
            // Given a board where a first move has been done
            const move: M = testUtils.getComponent().generateMove(5);
            await expectMoveSuccess('#click_5_1', move);

            // When doing second single distribution move
            // Then it should be a success too
            await expectMoveSuccess('#click_5_0', move);
        }));
        it('should display last move after basic move', fakeAsync(async() => {
            // Given any state (initial here by default)

            // When player performs a move
            const move: M = testUtils.getComponent().generateMove(5);
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
        it('should forbid moving empty house', fakeAsync(async() => {
            // Given a state with an empty house
            const board: Table<number> = [
                [0, 4, 4, 4, 4, 4],
                [4, 4, 4, 4, 4, 4],
            ];
            const state: MancalaState = new MancalaState(board, 1, [0, 0]);
            await testUtils.setupState(state);

            // When clicking on the empty house
            // Then it should fail
            const reason: string = MancalaFailure.MUST_CHOOSE_NON_EMPTY_HOUSE();
            await testUtils.expectClickFailure('#click_0_0', reason);
        }));
        it(`should forbid moving opponent's house`, fakeAsync(async() => {
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
        it('should hide last move when taking move back', fakeAsync(async() => {
            // Given a board with a last move
            const move: M = testUtils.getComponent().generateMove(5);
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
        it('should display score of players on the board', fakeAsync(async() => {
            // Given a board with captured piece
            const state: MancalaState = new MancalaState([
                [4, 4, 4, 4, 4, 4],
                [4, 4, 4, 4, 4, 4],
            ], 0, [1, 2]);

            // When rendering it
            await testUtils.setupState(state);

            // Then player zero's captures should be displayed
            const zeroContent: DebugElement = testUtils.findElement('#number_-1_-1');
            expect(zeroContent.nativeElement.innerHTML).toBe(' 1 ');
            // And player one's captures should be displayed too
            const oneContent: DebugElement = testUtils.findElement('#number_2_2');
            expect(oneContent.nativeElement.innerHTML).toBe(' 2 ');
        }));
        it('should display mansoon capture', fakeAsync(async() => {
            // Given a board where the player is about to give his last seed to the opponent
            await testUtils.setupState(entries.mansoonableState);

            // When doing the capturing move
            const lastMoveX: number = entries.mansooningMove.subMoves[0].x;
            const startingSuffix: string = lastMoveX + '_' + (entries.mansoonableState.turn + 1) % 2;
            await expectMoveSuccess('#click_' + startingSuffix, entries.mansooningMove);

            // Then the space in question should be marked as "captured"
            for (const mansooned of entries.mansoonedCoords) {
                expectToBeCaptured(mansooned);
            }
        }));
        it('should display capture', fakeAsync(async() => {
            // Given a state where player zero can capture
            await testUtils.setupState(entries.capturableState);

            // When player zero clicks on a house to distribute
            const lastMoveX: number = entries.capturingMove.subMoves[0].x;
            const startingSuffix: string = lastMoveX + '_' + (entries.capturableState.turn + 1) % 2;
            await expectMoveSuccess('#click_' + startingSuffix, entries.capturingMove);

            // Then the moved spaces should be shown
            // Initial element
            testUtils.expectElementToHaveClasses('#circle_' + startingSuffix, ['base', 'moved-stroke', 'last-move-stroke', 'player0-fill']);
            // as well as the captured spaces
            for (const captured of entries.capturedCoords) {
                expectToBeCaptured(captured);
            }
        }));
        describe('Move Animation', () => {
            it('should immediately highlight last move clicked house', fakeAsync(async() => {
                // Given any board
                // When clicking on a house
                const element: DebugElement = testUtils.findElement('#click_5_1');
                element.triggerEventHandler('click', null);
                tick(0);

                // Then no seed should be distributed
                let content: DebugElement = testUtils.findElement('#number_4_1');
                expect(content.nativeElement.innerHTML).toBe(' 4 ');
                testUtils.expectElementToHaveClasses('#circle_4_1', ['base', 'player0-fill']);

                // And the clicked space should be highlighted and already empty
                content = testUtils.findElement('#number_5_1');
                expect(content.nativeElement.innerHTML).toBe(' 0 ');
                testUtils.expectElementToHaveClasses('#circle_5_1', ['base', 'moved-stroke', 'last-move-stroke', 'player0-fill']);

                // Finish the distribution
                tick(1000);
            }));
            it('should show right after the first seed being drop', fakeAsync(async() => {
                // Given any board on which several seeds have been chosen to be distributed
                const element: DebugElement = testUtils.findElement('#click_5_1');
                element.triggerEventHandler('click', null);

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
                // When distributing a house
                const element: DebugElement = testUtils.findElement('#click_5_1');
                element.triggerEventHandler('click', null);

                // Then it should take 200ms by seed to finish distribute it, + 200ms
                tick((4 + 1) * 200);
            }));
        });
        it('should have a bijective encoder', () => {
            // const rules: R = testUtils.getComponent().rules;
            // const encoder: MoveEncoder<M> = testUtils.getComponent().encoder;
            // const minimax: MancalaMinimax = new MancalaMinimax(rules, 'MancalaMinimax');
            // const firstTurnMoves: M[] = minimax
            //     .getListMoves(rules.getInitialNode())
            //     .map((move: MancalaMove) => {
            //         return entries.moveProvider(move.getStart(), move.getEnd());
            //     });
            // for (const move of firstTurnMoves) {
            //     EncoderTestUtils.expectToBeBijective(encoder, move);
            // }
            // TODO
        });
        it('should hide first move when taking back', fakeAsync(async() => {
            // TODO
        }));
    });
}
