/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { SixState } from 'src/app/games/six/SixState';
import { SixMove } from 'src/app/games/six/SixMove';
import { SixFailure } from 'src/app/games/six/SixFailure';
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/jscaip/TableUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { SixComponent } from '../six.component';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('SixComponent', () => {

    let testUtils: ComponentTestUtils<SixComponent>;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = Player.ZERO;
    const X: PlayerOrNone = Player.ONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<SixComponent>('Six');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('First click (drop/selection)', () => {

        it('should cancel move when clicking on opponent piece', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [O],
            ];
            const state: SixState = SixState.ofRepresentation(board, 41);
            await testUtils.setupState(state);

            await testUtils.expectClickFailure('#piece_0_0', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }));

        it('should drop before 40th turn', fakeAsync(async() => {
            const move: SixMove = SixMove.ofDrop(new Coord(0, 2));
            await testUtils.expectMoveSuccess('#neighbor_0_2', move);
        }));

        it('should cancel move when clicking on empty space as first click after 40th turn', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [O],
                [X],
                [O],
                [X],
                [O],
                [X],
            ];
            const state: SixState = SixState.ofRepresentation(board, 40);
            await testUtils.setupState(state);

            await testUtils.expectClickFailure('#neighbor_1_1', SixFailure.CAN_NO_LONGER_DROP());
        }));

        it('should cancel move when clicking on piece before 40th turn', fakeAsync(async() => {
            await testUtils.expectClickFailure('#piece_0_0', SixFailure.NO_MOVEMENT_BEFORE_TURN_40());
        }));

        it('should select piece when clicking on it (in moving phase)', fakeAsync(async() => {
            // Given a board in moving phase
            const board: Table<PlayerOrNone> = [
                [O],
                [X],
                [O],
                [X],
                [O],
                [X],
            ];
            const state: SixState = SixState.ofRepresentation(board, 40);
            await testUtils.setupState(state);

            // When clicking on one of the user's pieces
            await testUtils.expectClickSuccess('#piece_0_0');

            // Then the piece should be selected
            testUtils.expectElementToExist('#selectedPiece_0_0');
        }));
    });

    describe('Second click (landing)', () => {

        it('should do movement after the 39th turn and show left coords', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [O],
                [X],
                [O],
                [X],
                [O],
                [X],
            ];
            const state: SixState = SixState.ofRepresentation(board, 40);
            await testUtils.setupState(state);

            const gameComponent: SixComponent = testUtils.getGameComponent();
            await testUtils.expectClickSuccess('#piece_0_0');
            testUtils.expectElementToExist('#selectedPiece_0_0');
            const move: SixMove = SixMove.ofMovement(new Coord(0, 0), new Coord(0, 6));
            await testUtils.expectMoveSuccess('#neighbor_0_6', move);
            testUtils.expectElementToExist('#leftCoord_0_0');
            testUtils.expectElementToExist('#lastDrop_0_6');
            expect(gameComponent.getPieceClass(new Coord(0, 6))).toBe('player0-fill');
        }));

        it('should deselect piece when clicking a second time on it', fakeAsync(async() => {
            // Given a board in moving phase, where a piece is selected
            const board: Table<PlayerOrNone> = [
                [O],
                [X],
                [O],
                [X],
                [O],
                [X],
            ];
            const state: SixState = SixState.ofRepresentation(board, 40);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#piece_0_0');

            // When clicking on it again
            await testUtils.expectClickFailure('#piece_0_0');

            // Then the piece should no longer be selected
            testUtils.expectElementNotToExist('#selectedPiece_0_0');
        }));

    });

    describe('Third click (cutting)', () => {

        it('should ask to cut when needed', fakeAsync(async() => {
            // Given a board with a chosen piece and chosen landing
            const board: Table<PlayerOrNone> = [
                [O, _, O],
                [X, _, O],
                [O, O, X],
                [X, _, _],
            ];
            const state: SixState = SixState.ofRepresentation(board, 40);
            await testUtils.setupState(state);

            // Choosing piece
            await testUtils.expectClickSuccess('#piece_1_2');

            // Choosing landing space
            await testUtils.expectClickSuccess('#neighbor_2_3');
            testUtils.expectElementNotToExist('#piece_2_3'); // Landing coord should be filled
            testUtils.expectElementToExist('#chosenLanding_2_3'); // Landing coord should be filled
            testUtils.expectElementNotToExist('#neighbor_2_3'); // And no longer an empty coord

            testUtils.expectElementNotToExist('#piece_1_2'); // Piece should be moved
            testUtils.expectElementToExist('#selectedPiece_1_2'); // Piece should not be highlighted anymore

            // Expect to choosable cut to be showed
            testUtils.expectElementToExist('#cuttable_0_0');
            testUtils.expectElementToExist('#cuttable_0_1');
            testUtils.expectElementToExist('#cuttable_0_2');
            testUtils.expectElementToExist('#cuttable_0_3');
            testUtils.expectElementToExist('#cuttable_2_0');
            testUtils.expectElementToExist('#cuttable_2_1');
            testUtils.expectElementToExist('#cuttable_2_2');
            testUtils.expectElementToExist('#cuttable_2_3');
            const move: SixMove = SixMove.ofCut(new Coord(1, 2), new Coord(2, 3), new Coord(2, 0));
            await testUtils.expectMoveSuccess('#piece_2_0', move);
            testUtils.expectElementToExist('#disconnected_0_0');
            testUtils.expectElementToExist('#disconnected_0_1');
            testUtils.expectElementToExist('#disconnected_0_2');
            testUtils.expectElementToExist('#disconnected_0_3');
        }));

        it('should show as disconnected opponent lastDrop if he is dumb enough to do that', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [O, _, O],
                [X, _, O],
                [O, O, X],
                [X, _, _],
            ];
            const state: SixState = SixState.ofRepresentation(board, 40);
            await testUtils.setupState(state);

            // Choosing piece
            await testUtils.expectClickSuccess('#piece_1_2');

            // Choosing landing space
            await testUtils.expectClickSuccess('#neighbor_2_3');
            const move: SixMove = SixMove.ofCut(new Coord(1, 2), new Coord(2, 3), new Coord(0, 0));
            await testUtils.expectMoveSuccess('#piece_0_0', move);
            testUtils.expectElementToExist('#disconnected_2_0');
            testUtils.expectElementToExist('#disconnected_2_1');
            testUtils.expectElementToExist('#disconnected_2_2');
            testUtils.expectElementToExist('#disconnected_2_3');
        }));

        it('should cancel the move if player clicks on an empty space instead of chosing a group for cutting', fakeAsync(async() => {
            // Given that a cuttable group must be selected by the user
            const board: Table<PlayerOrNone> = [
                [O],
                [X],
                [O],
                [X],
                [O],
                [X],
            ];
            const state: SixState = SixState.ofRepresentation(board, 40);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#piece_0_2');
            await testUtils.expectClickSuccess('#neighbor_0_-1');

            // When the user clicks on an empty space instead of selecting a group
            // Then it should fail
            await testUtils.expectClickFailure('#neighbor_1_-1', SixFailure.MUST_CUT());
            testUtils.expectElementToExist('#piece_0_2');
        }));

        it('should still allow to click on opponent piece after 40th as a third click', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [O],
                [X],
                [O],
                [X],
                [O],
                [X],
            ];
            const state: SixState = SixState.ofRepresentation(board, 40);
            await testUtils.setupState(state);

            await testUtils.expectClickSuccess('#piece_0_2');
            await testUtils.expectClickSuccess('#neighbor_0_-1');
            const move: SixMove = SixMove.ofCut(new Coord(0, 2), new Coord(0, -1), new Coord(0, 1));
            await testUtils.expectMoveSuccess('#piece_0_1', move);
        }));

    });

    describe('view', () => {

        it('should highlight winning coords', fakeAsync(async() => {
            const board: Table<PlayerOrNone> = [
                [O, _, _, _, _, _, _, _, _, _],
                [O, O, O, O, O, X, X, X, X, X],
                [_, _, _, _, _, _, _, _, _, X],
            ];
            const state: SixState = SixState.ofRepresentation(board, 42);
            await testUtils.setupState(state);

            await testUtils.expectClickSuccess('#piece_0_0');
            const move: SixMove = SixMove.ofMovement(new Coord(0, 0), new Coord(-1, 1));
            await testUtils.expectMoveSuccess('#neighbor_-1_1', move);
            testUtils.expectElementToHaveClass('#victoryCoord_-1_1', 'victory-stroke');
            testUtils.expectElementToHaveClass('#victoryCoord_4_1', 'victory-stroke');
        }));

    });

});
