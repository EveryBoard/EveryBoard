/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { ConspirateursComponent } from '../conspirateurs.component';
import { ConspirateursFailure } from '../ConspirateursFailure';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveJump, ConspirateursMoveSimple } from '../ConspirateursMove';
import { ConspirateursState } from '../ConspirateursState';

describe('ConspirateursComponent', () => {
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    let testUtils: ComponentTestUtils<ConspirateursComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<ConspirateursComponent>('Conspirateurs');
    }));
    it('should create', () => {
        expect(testUtils.wrapper).withContext('should be created').toBeTruthy();
        expect(testUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    describe('drop phase', () => {
        it('should allow drops at the beginning of the game with a simple click', fakeAsync(async() => {
            // Given the initial state
            // When clicking in the central zone
            // Then a drop should be made
            const move: ConspirateursMove = ConspirateursMoveDrop.of(new Coord(7, 7)).get();
            await testUtils.expectMoveSuccess('#click_7_7', move);
        }));
        it('should forbid dropping outside of the central zone', fakeAsync(async() => {
            // Given the initial state
            // When clicking out of the central zone
            // Then an error should be shown
            const move: ConspirateursMove = ConspirateursMoveDrop.of(new Coord(0, 0)).get();
            await testUtils.expectMoveFailure('#click_0_0', ConspirateursFailure.MUST_DROP_IN_CENTRAL_ZONE(), move);
        }));
        it('should display the number of remaining pieces (even turn)', fakeAsync(async() => {
            // Given the initial state
            // When it is displayed
            // Then both players should have 20 remaining pieces (0 to 19)
            testUtils.expectElementToExist('#sidePiece_0_19');
            testUtils.expectElementToExist('#sidePiece_1_19');
        }));
        it('should display the number of remaining pieces (odd turn)', fakeAsync(async() => {
            // Given a state in the drop phase at turn 1
            const state: ConspirateursState = new ConspirateursState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);
            // When it is displayed
            testUtils.setupState(state);
            // Then player 0 should have 19 pieces (0 to 18) and player 1 should have 20 (0 to 19)
            testUtils.expectElementNotToExist('#sidePiece_0_19');
            testUtils.expectElementToExist('#sidePiece_0_18');
            testUtils.expectElementToExist('#sidePiece_1_19');
        }));
    });
    describe('move phase', () => {
        beforeEach(() => {
            // Given a state after the drop phase
            const state: ConspirateursState = new ConspirateursState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, O, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, X, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 42);
            testUtils.setupState(state);
        });
        it('should cancel jump when clicking on another piece of the player', fakeAsync(async() => {
            // Given a jump being in construction
            await testUtils.expectClickSuccess('#click_5_4');
            await testUtils.expectClickSuccess('#click_5_2');
            // When clicking on another piece of the current player
            await testUtils.expectClickSuccess('#click_7_5');
            // Then the new piece should be selected
            testUtils.expectElementToHaveClass('#piece_7_5', 'selected');
        }));
        it('should not allow selecting an empty space', fakeAsync(async() => {
            // When clicking on an empty space
            // Then the click should be rejected
            await testUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }));
        it('should allow performing a simple move by clicking on a piece and then on its destination', fakeAsync(async() => {
            // Given a player piece that is selected
            await testUtils.expectClickSuccess('#click_5_4');
            // When clicking on its destination
            // Then the simple move should be performed
            const move: ConspirateursMoveSimple = ConspirateursMoveSimple.of(new Coord(5, 4), new Coord(4, 4)).get();
            await testUtils.expectMoveSuccess('#click_4_4', move);
        }));
        it('should forbid illegal simple moves', fakeAsync(async() => {
            // Given a player piece that is selected
            await testUtils.expectClickSuccess('#click_5_4');
            // When clicking on an illegal destination
            // Then the move fails
            const move: ConspirateursMoveSimple = ConspirateursMoveSimple.of(new Coord(5, 4), new Coord(5, 3)).get();
            await testUtils.expectMoveFailure('#click_5_3', RulesFailure.MUST_LAND_ON_EMPTY_SPACE(), move);
        }));
        it('should allow performing a jump in two clicks if this is the only choice', fakeAsync(async() => {
            // When clicking on a player piece and then on a jump destination
            await testUtils.expectClickSuccess('#click_5_4');
            // Then the jump should be directly performed
            const move: ConspirateursMoveJump = ConspirateursMoveJump.of([new Coord(5, 4), new Coord(5, 6)]).get();
            await testUtils.expectMoveSuccess('#click_5_6', move);
        }));
        it('should allow performing multiple jumps', fakeAsync(async() => {
            // When clicking on a piece and then on all jump steps up to the final one
            await testUtils.expectClickSuccess('#click_5_4');
            await testUtils.expectClickSuccess('#click_5_2');
            // Then the jump should be performed
            const move: ConspirateursMoveJump =
                ConspirateursMoveJump.of([new Coord(5, 4), new Coord(5, 2), new Coord(7, 2)]).get();
            await testUtils.expectMoveSuccess('#click_7_2', move);
        }));
        it('should allow stopping a jump early by clicking twice on the destination', fakeAsync(async() => {
            // When clicking on the desired jump steps and then a second time on the final step
            await testUtils.expectClickSuccess('#click_5_4');
            await testUtils.expectClickSuccess('#click_5_2');
            // Then the jump should be performed
            const move: ConspirateursMoveJump = ConspirateursMoveJump.of([new Coord(5, 4), new Coord(5, 2)]).get();
            await testUtils.expectMoveSuccess('#click_5_2', move);
        }));
        it('should forbid creation of invalid jumps', fakeAsync(async() => {
            // Given a selected piece
            await testUtils.expectClickSuccess('#click_5_4');
            // When clicking on an invalid jump target
            // Then the click fails
            await testUtils.expectClickFailure('#click_5_8', ConspirateursFailure.INVALID_JUMP());
        }));
        it('should forbid creation of invalid jumps with multiple steps', fakeAsync(async() => {
            // Given a jump being constructed
            await testUtils.expectClickSuccess('#click_5_4');
            await testUtils.expectClickSuccess('#click_5_2');
            // When clicking on an invalid jump target
            // Then the click fails
            await testUtils.expectClickFailure('#click_2_2', ConspirateursFailure.INVALID_JUMP());
        }));
        it('should forbid creation of illegal jumps with multiple steps', fakeAsync(async() => {
            // Given a jump being constructed
            await testUtils.expectClickSuccess('#click_5_4');
            await testUtils.expectClickSuccess('#click_5_2');
            // When clicking on an invalid jump target
            // Then the click fails
            await testUtils.expectClickFailure('#click_5_0', ConspirateursFailure.MUST_JUMP_OVER_PIECES());
        }));
        it('should not display any remaining piece', fakeAsync(async() => {
            testUtils.expectElementNotToExist('#sidePiece_0_0');
            testUtils.expectElementNotToExist('#sidePiece_1_0');
        }));
    });
    it('should highlight shelters of victorious pieces upon victory', fakeAsync(async() => {
        // Given a state where player 1 has sheltered all of its pieces
        const state: ConspirateursState = new ConspirateursState([
            [X, X, _, X, _, X, _, X, X, X, _, X, _, X, _, X, X],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], 60);
        // When the state is displayed
        testUtils.setupState(state);
        // The its pieces are highlighted
        testUtils.expectElementToHaveClass('#click_0_0', 'victory');
    }));
});
