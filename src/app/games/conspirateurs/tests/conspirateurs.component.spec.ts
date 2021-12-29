/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { ConspirateursComponent } from '../conspirateurs.component';
import { ConspirateursFailure } from '../ConspirateursFailure';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveJump, ConspirateursMoveSimple } from '../ConspirateursMove';
import { ConspirateursState } from '../ConspirateursState';

fdescribe('ConspirateursComponent', () => {
    const _: Player = Player.NONE;
    const A: Player = Player.ZERO;
    const B: Player = Player.ONE;

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
            // Then a drop is made
            const move: ConspirateursMove = ConspirateursMoveDrop.of(new Coord(7, 7)).get();
            await testUtils.expectMoveSuccess('#click_7_7', move);
        }));
        it('should forbid dropping outside of the central zone', fakeAsync(async() => {
            // Given the initial state
            // When clicking out of the central zone
            // Then an error is shown
            const move: ConspirateursMove = ConspirateursMoveDrop.of(new Coord(0, 0)).get();
            await testUtils.expectMoveFailure('#click_0_0', ConspirateursFailure.MUST_DROP_IN_CENTRAL_ZONE(), move);
        }));
    });
    describe('move phase', () => {
        beforeEach(() => {
            // Given a state after the drop phase
            const state: ConspirateursState = new ConspirateursState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, B, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, B, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, A, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, B, _, _, _, _, _, _, _, _, _, _, _],
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
        it('should not allow selecting an empty space', fakeAsync(async() => {
            // When clicking on an empty space
            // Then the click is rejected
            await testUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }));
        it('should allow performing a simple move by clicking on a piece and then on its destination', fakeAsync(async() => {
            // Given that a player piece is selected
            await testUtils.expectClickSuccess('#click_5_4');
            // When clicking on its destination
            // Then the simple move is performed
            const move: ConspirateursMoveSimple = ConspirateursMoveSimple.of(new Coord(5, 4), new Coord(4, 4)).get();
            await testUtils.expectMoveSuccess('#click_4_4', move);
        }));
        it('should forbid illegal simple moves', fakeAsync(async() => {
            // Given that a player piece is selected
            await testUtils.expectClickSuccess('#click_5_4');
            // When clicking on an illegal destination
            // Then the move fails
            const move: ConspirateursMoveSimple = ConspirateursMoveSimple.of(new Coord(5, 4), new Coord(5, 3)).get();
            await testUtils.expectMoveFailure('#click_5_3', RulesFailure.MUST_LAND_ON_EMPTY_SPACE(), move);
        }));
        it('should allow performing a jump in two clicks if this is the only choice', fakeAsync(async() => {
            // When clicking on a player piece and then on a jump destination
            await testUtils.expectClickSuccess('#click_5_4');
            // Then the jump is directly performed
            const move: ConspirateursMoveJump = ConspirateursMoveJump.of([new Coord(5, 4), new Coord(5, 6)]).get();
            await testUtils.expectMoveSuccess('#click_5_6', move);
        }));
        it('should allow performing multiple jumps', fakeAsync(async() => {
            // When clicking on a piece and then on all jump steps up to the final one
            await testUtils.expectClickSuccess('#click_5_4');
            await testUtils.expectClickSuccess('#click_5_2');
            // Then the jump is performed
            const move: ConspirateursMoveJump =
                ConspirateursMoveJump.of([new Coord(5, 4), new Coord(5, 2), new Coord(7, 2)]).get();
            await testUtils.expectMoveSuccess('#click_7_2', move);
        }));
        it('should allow stopping a jump early by clicking twice on the destination', fakeAsync(async() => {
            // When clicking on the desired jump steps and then a second time on the final step
            await testUtils.expectClickSuccess('#click_5_4');
            await testUtils.expectClickSuccess('#click_5_2');
            // Then the jump is performed
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
    });
});
