/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';

import { Coord } from '@everyboard/games';
import { Player } from '@everyboard/games';
import { TrexoMove } from '@everyboard/games';
import { TrexoPiece, TrexoPieceStack, TrexoState } from '@everyboard/games';
import { TrexoFailure } from '@everyboard/games';

import { ComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { TrexoComponent } from '../trexo.component';

const _____: TrexoPieceStack = TrexoPieceStack.EMPTY;
const O1_T0: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ZERO, 0)]);
const O1_T1: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ZERO, 1)]);
const O2_T2: TrexoPieceStack = TrexoPieceStack.of([
    new TrexoPiece(Player.ZERO, 0),
    new TrexoPiece(Player.ZERO, 2),
]);
const O1_T3: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ZERO, 3)]);
const X1_T0: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ONE, 0)]);
const X1_T1: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ONE, 1)]);
const X2_T2: TrexoPieceStack = TrexoPieceStack.of([
    new TrexoPiece(Player.ONE, 0),
    new TrexoPiece(Player.ONE, 2),
]);
const X1_T3: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ONE, 3)]);

describe('TrexoComponent', () => {

    let testUtils: ComponentTestUtils<TrexoComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<TrexoComponent>('Trexo');
    }));

    describe('Commons tests', () => {
        for (const switchTo2D of [false, true]) {
            const name: string = switchTo2D ? '3D' : '2D';

            describe(name, () => {
                beforeEach(fakeAsync(async() => {
                    if (switchTo2D) {
                        await testUtils.clickElement('#switch-to-2D');
                    }
                }));

                it('should create a third level', fakeAsync(async() => {
                    // Given a board with two level
                    const X0_X2: TrexoPieceStack = TrexoPieceStack.of([
                        new TrexoPiece(Player.ZERO, 0),
                        new TrexoPiece(Player.ZERO, 2),
                    ]);
                    const X0_O3: TrexoPieceStack = TrexoPieceStack.of([
                        new TrexoPiece(Player.ONE, 0),
                        new TrexoPiece(Player.ZERO, 3),
                    ]);
                    const O1_X2: TrexoPieceStack = TrexoPieceStack.of([
                        new TrexoPiece(Player.ZERO, 1),
                        new TrexoPiece(Player.ONE, 2),
                    ]);
                    const O1_X3: TrexoPieceStack = TrexoPieceStack.of([
                        new TrexoPiece(Player.ONE, 1),
                        new TrexoPiece(Player.ONE, 3),
                    ]);
                    const state: TrexoState = TrexoState.of([
                        [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                        [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                        [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                        [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                        [_____, _____, _____, _____, X0_X2, O1_X2, _____, _____, _____, _____],
                        [_____, _____, _____, _____, X0_O3, O1_X3, _____, _____, _____, _____],
                        [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                        [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                        [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                        [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                    ], 4);
                    await testUtils.setupState(state);

                    // When dropping a piece on the third level
                    await testUtils.expectClickSuccess('#space-4-4');
                    const move: TrexoMove = TrexoMove.from(new Coord(4, 5), new Coord(4, 4)).get();
                    await testUtils.expectMoveSuccess('#space-4-5', move);

                    // Then it should display a third level piece
                    testUtils.expectElementToExist('#half-tile-4-4-2');
                    testUtils.expectElementToExist('#half-tile-4-5-2');
                }));

                describe('first click', () => {
                    it(`should drop the opponent's piece first`, fakeAsync(async() => {
                        // Given any board
                        // When clicking on a possible first coord
                        // Then the click should be a success
                        await testUtils.expectClickSuccess('#space-5-5');
                        // and a dropped piece for the opponent should be displayed
                        testUtils.expectElementToExist('#dropped-piece-5-5-0');
                    }));

                    it(`should fail when clicking on an isolated piece`, fakeAsync(async() => {
                        // Given a board on which 1 space is higher than all its neighbooring space (except its "twin")
                        const state: TrexoState = TrexoState.of([
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, O1_T0, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, X1_T0, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                        ], 1);
                        await testUtils.setupState(state);

                        // When trying to choose it as first coord
                        // Then it should fail
                        const reason: string = TrexoFailure.NO_WAY_TO_DROP_IT_HERE();
                        await testUtils.expectClickFailure('#space-4-4', reason);
                    }));

                    it('should show possible next click amongst the possible neigbhors', fakeAsync(async() => {
                        // Given any board
                        // When clicking on a possible first coord (whose neighbor are empty spaces)
                        await testUtils.expectClickSuccess('#space-5-5');
                        // Then the possible next click should be highlighted
                        testUtils.expectElementToHaveClass('#space-4-5', 'darker');
                        testUtils.expectElementToHaveClass('#space-6-5', 'darker');
                        testUtils.expectElementToHaveClass('#space-5-4', 'darker');
                        testUtils.expectElementToHaveClass('#space-5-6', 'darker');
                    }));

                    it('should allow clicking on second level', fakeAsync(async() => {
                        // Given any board where two neighboring tiles are on the same level
                        await testUtils.expectClickSuccess('#space-0-0');
                        let move: TrexoMove = TrexoMove.from(new Coord(0, 1), new Coord(0, 0)).get();
                        await testUtils.expectMoveSuccess('#space-0-1', move);
                        await testUtils.expectClickSuccess('#space-1-0');
                        move = TrexoMove.from(new Coord(1, 0), new Coord(1, 1)).get();
                        await testUtils.expectMoveSuccess('#space-1-1', move);

                        // When clicking on one of them
                        await testUtils.expectClickSuccess('#space-0-0');

                        // Then the dropped piece should appear on it
                        testUtils.expectElementToExist('#dropped-piece-0-0-1');
                    }));

                    it('should display darker landable pieces when possible landing are not the floor', fakeAsync(async() => {
                        // Given any board where two neighboring tiles are on the same level
                        await testUtils.expectClickSuccess('#space-0-0');
                        let move: TrexoMove = TrexoMove.from(new Coord(0, 1), new Coord(0, 0)).get();
                        await testUtils.expectMoveSuccess('#space-0-1', move);
                        await testUtils.expectClickSuccess('#space-1-0');
                        move = TrexoMove.from(new Coord(1, 0), new Coord(1, 1)).get();
                        await testUtils.expectMoveSuccess('#space-1-1', move);

                        // When selecting a piece on that level
                        await testUtils.expectClickSuccess('#space-0-0');

                        // Then the neighboring piece should be darker
                        testUtils.expectElementToHaveClass('#tile-1-0-0', 'darker');
                    }));
                });

                describe(`second click`, () => {
                    it(`should allow legal move`, fakeAsync(async() => {
                        // Given any board on which a first click has been made
                        await testUtils.expectClickSuccess('#space-5-5');

                        // When clicking on a valid neighbor coord
                        // Then the move should succeed, and the first click should be the piece of Player.ONE
                        // Because the opponent piece is dropped first
                        const move: TrexoMove = TrexoMove.from(new Coord(6, 5), new Coord(5, 5)).get();
                        await testUtils.expectMoveSuccess('#space-6-5', move);
                        testUtils.expectElementToExist('#half-tile-5-5-0');
                        testUtils.expectElementToExist('#half-tile-6-5-0');
                    }));

                    it('should allow dropping on second level', fakeAsync(async() => {
                        // Given any board where two neighboring tiles are on the same level
                        const state: TrexoState = TrexoState.of([
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, X1_T0, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, O1_T0, O1_T1, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, X1_T1, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                        ], 2);
                        await testUtils.setupState(state);
                        // And a first click has been done on that level
                        await testUtils.expectClickSuccess('#space-4-4');

                        // When clicking a second time
                        const move: TrexoMove = TrexoMove.from(new Coord(5, 4), new Coord(4, 4)).get();

                        // Then the move should succeed
                        await testUtils.expectMoveSuccess('#space-5-4', move);
                    }));

                    it(`should change the first dropped coord when clicking too far`, fakeAsync(async() => {
                        // Given any board on which a first click has been made
                        await testUtils.expectClickSuccess('#space-5-5');

                        // When clicking on a far away coord (that is still valid)
                        await testUtils.expectClickSuccess('#space-7-7');

                        // Then the dropped piece changed
                        testUtils.expectElementNotToExist('#dropped-piece-5-5-0');
                        testUtils.expectElementToExist('#dropped-piece-7-7-0');
                        // And the four "dark zone" around (5, 5) should have been removed
                        testUtils.expectElementNotToHaveClass('#space-5-4', 'darker');
                        testUtils.expectElementNotToHaveClass('#space-5-6', 'darker');
                        testUtils.expectElementNotToHaveClass('#space-4-5', 'darker');
                        testUtils.expectElementNotToHaveClass('#space-6-5', 'darker');
                        // And the four new "dark zone" arround (7, 7) should be there
                        testUtils.expectElementToHaveClass('#space-7-6', 'darker');
                        testUtils.expectElementToHaveClass('#space-7-8', 'darker');
                        testUtils.expectElementToHaveClass('#space-6-7', 'darker');
                        testUtils.expectElementToHaveClass('#space-8-7', 'darker');
                    }));

                    it(`should show last move`, fakeAsync(async() => {
                        // Given any board on which a first click has been made
                        await testUtils.expectClickSuccess('#space-5-5');

                        // When finalizing the move
                        const move: TrexoMove = TrexoMove.from(new Coord(4, 5), new Coord(5, 5)).get();
                        await testUtils.expectMoveSuccess('#space-4-5', move);

                        // Then the dropped coords should be highlighted
                        testUtils.expectElementToHaveClass('#tile-4-5-0', 'last-move-stroke');
                        testUtils.expectElementToHaveClass('#tile-5-5-0', 'last-move-stroke');
                    }));

                    it(`should cancel move when clicking again on the same coord`, fakeAsync(async() => {
                        // Given any board on which a first click has been made
                        await testUtils.expectClickSuccess('#space-5-5');

                        // When clicking on the same coord again
                        // Then the move should be canceled without toast
                        await testUtils.expectClickFailure('#space-5-5');
                        // And the piece deselected
                        testUtils.expectElementNotToExist('#dropped-piece-5-5');
                    }));

                    it('should highlight victory', fakeAsync(async() => {
                        // Given any board on which a 4 moves have already been done, aligning piece of Player.ZERO
                        const state: TrexoState = TrexoState.of([
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, X1_T0, _____, X2_T2, _____, _____, _____, _____],
                            [_____, _____, _____, O1_T0, O1_T1, O2_T2, O1_T3, _____, _____, _____],
                            [_____, _____, _____, _____, X1_T1, _____, X1_T3, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                            [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                        ], 4);
                        await testUtils.setupState(state);
                        await testUtils.expectClickSuccess('#space-7-2');

                        // When doing the victorious move
                        const move: TrexoMove = TrexoMove.from(new Coord(7, 3), new Coord(7, 2)).get();

                        // Then the 5 victory coords should be highlighted
                        await testUtils.expectMoveSuccess('#space-7-3', move);
                        testUtils.expectElementToHaveClass('#tile-3-3-0', 'victory-stroke');
                        testUtils.expectElementToHaveClass('#tile-4-3-0', 'victory-stroke');
                        testUtils.expectElementToHaveClass('#tile-5-3-0', 'victory-stroke');
                        testUtils.expectElementToHaveClass('#tile-6-3-0', 'victory-stroke');
                        testUtils.expectElementToHaveClass('#tile-7-3-0', 'victory-stroke');
                    }));
                });

            });
        }
    });

    describe(`view`, () => {

        it(`should provide a button to switch 2D`, fakeAsync(async() => {
            // Given a component just started
            // When clicking on the switch-to-2D button
            await testUtils.clickElement('#switch-to-2D');

            // Then switch-to-3D should now be visible
            testUtils.expectElementToExist('#switch-to-3D');
        }));

        it(`should provide a button to switch to 3D when in 2D`, fakeAsync(async() => {
            // Given a component on which we are in 2D mode
            await testUtils.clickElement('#switch-to-2D');

            // When clicking on the switch-to-3D button
            await testUtils.clickElement('#switch-to-3D');

            // Then switch-to-2D should now be visible again
            testUtils.expectElementToExist('#switch-to-2D');
        }));

        it('should ask tile to display number when 2D mode', fakeAsync(async() => {
            // Given a board in 3D move with one move done already
            await testUtils.expectClickSuccess('#space-5-5');
            const move: TrexoMove = TrexoMove.from(new Coord(4, 5), new Coord(5, 5)).get();
            await testUtils.expectMoveSuccess('#space-4-5', move);

            // When choosing 2D move
            await testUtils.clickElement('#switch-to-2D');

            // Then number indicating the height should be present on pieces
            const height: DebugElement = testUtils.findElement('#height-5-5-0');
            expect(height.nativeElement.innerHTML).toBe('0');
        }));

        it('should not transfer upper piece style to lower piece', fakeAsync(async() => {
            // Given one 3D display with one Stack in two color
            const O0_X2: TrexoPieceStack = TrexoPieceStack.of([
                new TrexoPiece(Player.ZERO, 0),
                new TrexoPiece(Player.ONE, 2),
            ]);
            const O1_X2: TrexoPieceStack = TrexoPieceStack.of([
                new TrexoPiece(Player.ZERO, 1),
                new TrexoPiece(Player.ONE, 2),
            ]);
            const state: TrexoState = TrexoState.of([
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, X1_T0, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, O0_X2, O1_X2, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, X1_T1, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
                [_____, _____, _____, _____, _____, _____, _____, _____, _____, _____],
            ], 2);

            // When displaying it
            await testUtils.setupState(state);

            // Then lower piece should still be of Player.ZERO and higher be of Player.ONE
            testUtils.expectElementToHaveClass('#tile-4-4-0', 'player0-fill');
            testUtils.expectElementToHaveClass('#tile-4-4-1', 'player1-fill');
        }));

    });

});
