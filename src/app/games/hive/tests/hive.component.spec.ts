/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { HiveComponent } from '../hive.component';
import { HiveFailure } from '../HiveFailure';
import { HiveMove } from '../HiveMove';
import { HivePiece } from '../HivePiece';
import { HiveState } from '../HiveState';
import { HiveRules } from '../HiveRules';

describe('HiveComponent', () => {

    let testUtils: ComponentTestUtils<HiveComponent>;

    const Q: HivePiece = new HivePiece(Player.ZERO, 'QueenBee');
    const B: HivePiece = new HivePiece(Player.ZERO, 'Beetle');
    const G: HivePiece = new HivePiece(Player.ZERO, 'Grasshopper');
    const S: HivePiece = new HivePiece(Player.ZERO, 'Spider');
    const A: HivePiece = new HivePiece(Player.ZERO, 'SoldierAnt');
    const q: HivePiece = new HivePiece(Player.ONE, 'QueenBee');
    const b: HivePiece = new HivePiece(Player.ONE, 'Beetle');
    const g: HivePiece = new HivePiece(Player.ONE, 'Grasshopper');
    const s: HivePiece = new HivePiece(Player.ONE, 'Spider');
    const a: HivePiece = new HivePiece(Player.ONE, 'SoldierAnt');

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<HiveComponent>('Hive');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('drop', () => {

        describe('selection', () => {

            it('should select one of your pieces by clicking on it', fakeAsync(async() => {
                // Given a state with remaining pieces
                const state: HiveState = HiveRules.get().getInitialState();
                await testUtils.setupState(state);

                // When clicking on a remaining piece
                await testUtils.expectClickSuccess('#remainingPiece_QueenBee_PLAYER_ZERO');

                // Then it should be selected
                testUtils.expectElementToExist('#remaining_highlight');
            }));

            it('should forbid selecting a piece of the opponent', fakeAsync(async() => {
                // Given a state with remaining pieces
                const state: HiveState = HiveRules.get().getInitialState();
                await testUtils.setupState(state);

                // When clicking on a remaining piece of the opponent
                // Then it should fail
                const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
                await testUtils.expectClickFailure('#remainingPiece_QueenBee_PLAYER_ONE', reason);
            }));

            it('should show valid landings after selection', fakeAsync(async() => {
                // Given a state with remaining pieces
                const state: HiveState = HiveRules.get().getInitialState();
                await testUtils.setupState(state);

                // When clicking on a remaining piece
                await testUtils.expectClickSuccess('#remainingPiece_QueenBee_PLAYER_ZERO');

                // Then it should show valid landings
                testUtils.expectElementToHaveClass('#stroke_0_0', 'clickable-stroke');
            }));

            it('should forbid selecting another piece than the queen bee if the queen bee must be placed at this turn', fakeAsync(async() => {
                // Given a state without queen bee at the 4th turn of the current player
                const state: HiveState = HiveState.fromRepresentation([
                    [[B], [G], [A], [g], [s], [a]],
                ], 6);
                await testUtils.setupState(state);

                // When trying to select a remaining piece
                // Then it should fail
                const reason: string = HiveFailure.MUST_PLACE_QUEEN_BEE_LATEST_AT_FOURTH_TURN();
                await testUtils.expectClickFailure('#remainingPiece_Beetle_PLAYER_ZERO', reason);
            }));
        });

        describe('dropping', () => {

            it('should drop the piece on the selected space', fakeAsync(async() => {
                // Given a state with a selected remaining piece
                const state: HiveState = HiveRules.get().getInitialState();
                await testUtils.setupState(state);
                await testUtils.expectClickSuccess('#remainingPiece_QueenBee_PLAYER_ZERO');

                // When clicking on a valid landing
                // Then the move should succeed
                const move: HiveMove = HiveMove.drop(Q, new Coord(0, 0));
                await testUtils.expectMoveSuccess('#space_0_0', move);
            }));

            it('should fail dropping if the move is illegal', fakeAsync(async() => {
                // Given a state
                const state: HiveState = HiveState.fromRepresentation([
                    [[Q], [q]],
                ], 2);
                await testUtils.setupState(state);

                // When performing an illegal drop move
                await testUtils.expectClickSuccess('#remainingPiece_Beetle_PLAYER_ZERO');
                const move: HiveMove = HiveMove.drop(B, new Coord(2, 0));

                // Then it should fail
                const reason: string = HiveFailure.CANNOT_DROP_NEXT_TO_OPPONENT();
                await testUtils.expectMoveFailure('#space_2_0', reason, move);
            }));

            it('should show one less remaining piece after dropping', fakeAsync(async() => {
                // Given a state
                const state: HiveState = HiveRules.get().getInitialState();
                await testUtils.setupState(state);

                // When performing a drop move
                await testUtils.expectClickSuccess('#remainingPiece_QueenBee_PLAYER_ZERO');
                const move: HiveMove = HiveMove.drop(Q, new Coord(0, 0));
                await testUtils.expectMoveSuccess('#space_0_0', move);

                // Then the dropped piece should not be in the remaining pieces anymore
                testUtils.expectElementNotToExist('#remainingPiece_QueenBee_PLAYER_ZERO');
            }));

            it('should show the last move after dropping', fakeAsync(async() => {
                // Given a state
                const state: HiveState = HiveRules.get().getInitialState();
                await testUtils.setupState(state);

                // When performing a drop move
                await testUtils.expectClickSuccess('#remainingPiece_QueenBee_PLAYER_ZERO');
                const move: HiveMove = HiveMove.drop(Q, new Coord(0, 0));
                await testUtils.expectMoveSuccess('#space_0_0', move);

                // Then the last move should be shown
                testUtils.expectElementToHaveClass('#stroke_0_0', 'last-move-stroke');
            }));
        });

        it('should deselect the piece at second click on it', fakeAsync(async() => {
            // Given a state with remaining pieces and a selected one
            const state: HiveState = HiveRules.get().getInitialState();
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#remainingPiece_QueenBee_PLAYER_ZERO');

            // When clicking on the selected piece again
            await testUtils.expectClickSuccess('#remainingPiece_QueenBee_PLAYER_ZERO');

            // Then it should not be selected anymore
            testUtils.expectElementNotToExist('#remaining_highlight');
        }));
    });

    describe('moving', () => {

        describe('selection', () => {

            it('should select the piece clicked', fakeAsync(async() => {
                // Given a state with pieces on the board
                const state: HiveState = HiveState.fromRepresentation([
                    [[Q], [q]],
                ], 2);
                await testUtils.setupState(state);

                // When clicking on a piece on the board
                await testUtils.expectClickSuccess('#piece_0_0');

                // Then it should be selected
                testUtils.expectElementToHaveClass('#stroke_0_0', 'selected-stroke');
            }));

            it('should forbid selecting a piece of the opponent', fakeAsync(async() => {
                // Given a state with pieces on the board
                const state: HiveState = HiveState.fromRepresentation([
                    [[Q], [q]],
                ], 2);
                await testUtils.setupState(state);

                // When clicking on a piece of the opponent
                // Then it should fail
                const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
                await testUtils.expectClickFailure('#piece_1_0', reason);
            }));

            it('should show valid landings after selection', fakeAsync(async() => {
                // Given a state with pieces on the board
                const state: HiveState = HiveState.fromRepresentation([
                    [[Q], [q]],
                ], 2);
                await testUtils.setupState(state);

                // When clicking on a piece on the board
                await testUtils.expectClickSuccess('#piece_0_0');

                // Then it should show valid landings for that piece
                testUtils.expectElementToHaveClass('#stroke_1_-1', 'clickable-stroke');
                testUtils.expectElementToHaveClass('#stroke_0_1', 'clickable-stroke');

                testUtils.expectElementNotToExist('#stroke_0_-1');
                testUtils.expectElementNotToExist('#stroke_-1_0');
                testUtils.expectElementNotToExist('#stroke_-1_1');
                testUtils.expectElementNotToExist('#stroke_1_0');
            }));

            it('should not allow selecting piece if the queen bee must be dropped at this turn', fakeAsync(async() => {
                // Given a state without queen bee at the 4th turn of the current player
                const state: HiveState = HiveState.fromRepresentation([
                    [[B], [G], [A], [g], [s], [a]],
                ], 6);
                await testUtils.setupState(state);

                // When trying to select a piece
                // Then it should fail
                const reason: string = HiveFailure.MUST_PLACE_QUEEN_BEE_LATEST_AT_FOURTH_TURN();
                await testUtils.expectClickFailure('#piece_0_0', reason);
            }));

            it('should deselect if the piece is clicked a second time', fakeAsync(async() => {
                // Given a state with pieces on the board and a piece already selected
                const state: HiveState = HiveState.fromRepresentation([
                    [[Q], [q]],
                ], 2);
                await testUtils.setupState(state);
                await testUtils.expectClickSuccess('#piece_0_0');

                // When clicking on the selected piece again
                // Then it should cancel the move without error
                await testUtils.expectClickFailure('#piece_0_0');
            }));
        });

        describe('finishing move', () => {

            it('should move the piece to the clicked location', fakeAsync(async() => {
                // Given a state with pieces on the board and a selected piece
                const state: HiveState = HiveState.fromRepresentation([
                    [[Q], [q]],
                    [[B], []],
                ], 2);
                await testUtils.setupState(state);
                await testUtils.expectClickSuccess('#piece_0_1');

                // When clicking on a destination
                // Then the move should succeed
                const move: HiveMove = HiveMove.move(new Coord(0, 1), new Coord(1, 1)).get();
                await testUtils.expectMoveSuccess('#space_1_1', move);
            }));

            it('should fail moving when the move is illegal', fakeAsync(async() => {
                // Given a state with pieces on the board and a selected piece
                const state: HiveState = HiveState.fromRepresentation([
                    [[Q], [q]],
                    [[B], []],
                ], 2);
                await testUtils.setupState(state);
                await testUtils.expectClickSuccess('#piece_0_1');

                // When clicking on an illegal destination
                // Then the move should fail
                const reason: string = HiveFailure.CANNOT_DISCONNECT_HIVE();
                const move: HiveMove = HiveMove.move(new Coord(0, 1), new Coord(0, 2)).get();
                await testUtils.expectMoveFailure('#space_0_2', reason, move);
            }));
            describe('spider', () => {
                it('should allow selecting all intermediary spaces for spider', fakeAsync(async() => {
                    // Given a state with a spider on the board
                    const state: HiveState = HiveState.fromRepresentation([
                        [[b], []],
                        [[Q], [q]],
                        [[S], []],
                    ], 2);
                    await testUtils.setupState(state);

                    // When selecting a spider and clicking on 3 spaces to perform a spider move
                    await testUtils.expectClickSuccess('#piece_0_2');
                    await testUtils.expectClickSuccess('#space_1_2');
                    await testUtils.expectClickSuccess('#space_2_1');

                    // Then it should succeed on the third click
                    const move: HiveMove = HiveMove.spiderMove([
                        new Coord(0, 2),
                        new Coord(1, 2),
                        new Coord(2, 1),
                        new Coord(2, 0),
                    ]);
                    await testUtils.expectMoveSuccess('#space_2_0', move);
                }));

                it('should show valid intermediary spaces and the selected path', fakeAsync(async() => {
                    // Given a state with a spider on the board
                    const state: HiveState = HiveState.fromRepresentation([
                        [[b], []],
                        [[Q], [q]],
                        [[S], []],
                    ], 2);
                    await testUtils.setupState(state);

                    // When doing intermediary clicks
                    await testUtils.expectClickSuccess('#piece_0_2');
                    await testUtils.expectClickSuccess('#space_1_2');

                    // Then it should show valid landings and selected path
                    testUtils.expectElementToHaveClass('#stroke_2_1', 'clickable-stroke');
                    testUtils.expectElementToHaveClass('#stroke_0_2', 'selected-stroke');
                    testUtils.expectElementToHaveClass('#stroke_1_2', 'selected-stroke');
                }));

                it('should fail as soon as an invalid space is selected', fakeAsync(async() => {
                    // Given a state with a spider on the board and some path already selected
                    const state: HiveState = HiveState.fromRepresentation([
                        [[b], []],
                        [[Q], [q]],
                        [[S], []],
                    ], 2);
                    await testUtils.setupState(state);
                    await testUtils.expectClickSuccess('#piece_0_2');
                    await testUtils.expectClickSuccess('#space_1_2');

                    // When selecting an invalid landing intermediary space
                    // Then it should fail
                    const reason: string = HiveFailure.SPIDER_MUST_MOVE_ON_NEIGHBORING_SPACES();
                    await testUtils.expectClickFailure('#space_1_0', reason);
                }));
            });

            it('should show the last move', fakeAsync(async() => {
                // Given a state with a possible move
                const state: HiveState = HiveState.fromRepresentation([
                    [[Q], [q]],
                    [[B], []],
                ], 2);
                await testUtils.setupState(state);
                await testUtils.expectClickSuccess('#piece_0_1');

                // When performing a move
                const move: HiveMove = HiveMove.move(new Coord(0, 1), new Coord(1, 1)).get();
                await testUtils.expectMoveSuccess('#space_1_1', move);

                // Then the last move should be shown
                testUtils.expectElementToHaveClass('#stroke_0_1', 'last-move-stroke');
                testUtils.expectElementToHaveClass('#stroke_1_1', 'last-move-stroke');
                testUtils.expectElementToHaveClass('#space_0_1', 'moved-fill');
            }));
        });

    });

    describe('stacks', () => {

        it('should allow clicking on a stack with a beetle to inspect it', fakeAsync(async() => {
            // Given a state with a stack of pieces with a beetle of the player on top
            const state: HiveState = HiveState.fromRepresentation([
                [[B, b, Q], [q]],
            ], 2);
            await testUtils.setupState(state);

            // When clicking on the stack
            await testUtils.expectClickSuccess('#piece_0_0');

            // Then the stack should be displayed next to the board
            testUtils.expectElementToExist('#inspectedStack_0');
        }));

        it('should hide the stack when clicking a second time on it', fakeAsync(async() => {
            // Given a state with a stack of pieces displayed
            const state: HiveState = HiveState.fromRepresentation([
                [[B, b, Q], [q]],
            ], 2);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#piece_0_0');

            // When clicking on the stack a second time
            // Then it should cancel the move
            await testUtils.expectClickFailure('#piece_0_0');
        }));

        it('should allow clicking on a stack with a beetle to inspect it, even if controlled by the opponent', fakeAsync(async() => {
            // Given a state with a stack of pieces with a beetle of the player on top
            const state: HiveState = HiveState.fromRepresentation([
                [[b, B, Q], [q]],
            ], 2);
            await testUtils.setupState(state);

            // When clicking on the stack
            await testUtils.expectClickSuccess('#piece_0_0');

            // Then the stack should be displayed next to the board
            testUtils.expectElementToExist('#inspectedStack_0');
        }));

        it('should forbid clicking on a single beetle of the opponent', fakeAsync(async() => {
            // Given a state with a beetle of the opponent
            const state: HiveState = HiveState.fromRepresentation([
                [[b]],
            ], 2);
            await testUtils.setupState(state);

            // When clicking on the beetle
            // Then it should fail as there is no stack beneath it
            await testUtils.expectClickFailure('#piece_0_0', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }));

        it('should hide the stack of the opponent when clicking a second time on it', fakeAsync(async() => {
            // Given a state with a stack of pieces displayed
            const state: HiveState = HiveState.fromRepresentation([
                [[b, b, Q], [q]],
            ], 2);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#piece_0_0');
            testUtils.expectElementToExist('#inspectedStack_0');

            // When clicking on the stack a second time
            // Then it should hide the stack
            await testUtils.expectClickSuccess('#piece_0_0');
            testUtils.expectElementNotToExist('#inspectedStack_0');
        }));
    });

    it('should cancel move when clicking on an empty space', fakeAsync(async() => {
        // Given any state without a move in progress
        const state: HiveState = HiveState.fromRepresentation([
            [[Q], [b]],
        ], 2);
        await testUtils.setupState(state);

        // When clicking on an empty space
        // Then the move should be canceled
        await testUtils.expectClickFailure('#space_2_0');
    }));

    it('should allow to pass when player must pass', fakeAsync(async() => {
        // Given a stuck state
        const state: HiveState = HiveState.fromRepresentation([
            [[b, B], [Q], [q]],
        ], 4);

        // When it is displayed
        await testUtils.setupState(state);

        // Then the player can pass
        const move: HiveMove = HiveMove.PASS;
        await testUtils.expectPassSuccess(move);
    }));

    it('should display victorious coord', fakeAsync(async() => {
        // Given a victorious state
        const state: HiveState = HiveState.fromRepresentation([
            [[], [b], [b]],
            [[B], [q], [Q]],
            [[s], [A], []],
        ], 4);

        // When it is displayed
        await testUtils.setupState(state);

        // Then the victory should be shown
        testUtils.expectElementToHaveClass('#stroke_1_1', 'victory-stroke');
    }));

    it('should display draw coords', fakeAsync(async() => {
        // Given a draw state

        const state: HiveState = HiveState.fromRepresentation([
            [[], [b], [b], [a]],
            [[B], [q], [Q], [B]],
            [[s], [A], [S], []],
        ], 4);

        // When it is displayed
        await testUtils.setupState(state);

        // Then the draw should be shown (as multiple victory strokes)
        testUtils.expectElementToHaveClass('#stroke_1_1', 'victory-stroke');
        testUtils.expectElementToHaveClass('#stroke_2_1', 'victory-stroke');
    }));

    it('should show the last move when canceling a move', fakeAsync(async() => {
        // Given a state with a last move displayed
        const previousState: HiveState = HiveState.fromRepresentation([
            [[Q]],
        ], 1);
        const previousMove: HiveMove = HiveMove.drop(q, new Coord(1, 0));
        const state: HiveState = HiveState.fromRepresentation([
            [[Q], [q]],
        ], 2);
        await testUtils.setupState(state, previousState, previousMove);

        // When starting and then canceling a move
        await testUtils.expectClickSuccess('#piece_0_0');
        await testUtils.expectClickFailure('#piece_0_0');

        // Then the last move should still be displayed
        testUtils.expectElementToHaveClass('#stroke_1_0', 'last-move-stroke');
    }));
});
