/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { SixState } from 'src/app/games/six/SixState';
import { SixMove } from 'src/app/games/six/SixMove';
import { SixFailure } from 'src/app/games/six/SixFailure';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { SixComponent } from '../six.component';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('SixComponent', () => {

    let componentTestUtils: ComponentTestUtils<SixComponent>;

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<SixComponent>('Six');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('should cancel move when clicking on opponent piece', fakeAsync(async() => {
        const board: NumberTable = [
            [O],
        ];
        const state: SixState = SixState.fromRepresentation(board, 41);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickFailure('#piece_0_0', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    }));
    it('Should drop before 40th turn', fakeAsync(async() => {
        componentTestUtils.fixture.detectChanges();
        const move: SixMove = SixMove.fromDrop(new Coord(0, 2));
        await componentTestUtils.expectMoveSuccess('#neighbor_0_2', move);
    }));
    it('Should do movement after the 39th turn and show left coords', fakeAsync(async() => {
        const board: NumberTable = [
            [O],
            [X],
            [O],
            [X],
            [O],
            [X],
        ];
        const state: SixState = SixState.fromRepresentation(board, 40);
        componentTestUtils.setupState(state);

        const gameComponent: SixComponent = componentTestUtils.getComponent();
        await componentTestUtils.expectClickSuccess('#piece_0_0');
        componentTestUtils.expectElementToExist('#selectedPiece_0_0');
        const move: SixMove = SixMove.fromMovement(new Coord(0, 0), new Coord(0, 6));
        await componentTestUtils.expectMoveSuccess('#neighbor_0_6', move);

        componentTestUtils.expectElementToExist('#leftCoord_0_-1');
        componentTestUtils.expectElementToExist('#lastDrop_0_5');
        expect(gameComponent.getPieceClass(new Coord(0, 5))).toBe('player0');
    }));
    it('Should ask to cut when needed', fakeAsync(async() => {
        const board: NumberTable = [
            [O, _, O],
            [X, _, O],
            [O, O, X],
            [X, _, _],
        ];
        const state: SixState = SixState.fromRepresentation(board, 40);
        componentTestUtils.setupState(state);

        // Choosing piece
        await componentTestUtils.expectClickSuccess('#piece_1_2');

        // Choosing landing space
        await componentTestUtils.expectClickSuccess('#neighbor_2_3');
        componentTestUtils.expectElementNotToExist('#piece_2_3'); // Landing coord should be filled
        componentTestUtils.expectElementToExist('#chosenLanding_2_3'); // Landing coord should be filled
        componentTestUtils.expectElementNotToExist('#neighbor_2_3'); // And no longer an empty coord

        componentTestUtils.expectElementNotToExist('#piece_1_2'); // Piece should be moved
        componentTestUtils.expectElementToExist('#selectedPiece_1_2'); // Piece should not be highlighted anymore

        // Expect to choosable cut to be showed
        componentTestUtils.expectElementToExist('#cuttable_0_0');
        componentTestUtils.expectElementToExist('#cuttable_0_1');
        componentTestUtils.expectElementToExist('#cuttable_0_2');
        componentTestUtils.expectElementToExist('#cuttable_0_3');
        componentTestUtils.expectElementToExist('#cuttable_2_0');
        componentTestUtils.expectElementToExist('#cuttable_2_1');
        componentTestUtils.expectElementToExist('#cuttable_2_2');
        componentTestUtils.expectElementToExist('#cuttable_2_3');
        const move: SixMove = SixMove.fromCut(new Coord(1, 2), new Coord(2, 3), new Coord(2, 0));
        await componentTestUtils.expectMoveSuccess('#piece_2_0', move);
        componentTestUtils.expectElementToExist('#disconnected_-2_0');
        componentTestUtils.expectElementToExist('#disconnected_-2_1');
        componentTestUtils.expectElementToExist('#disconnected_-2_2');
        componentTestUtils.expectElementToExist('#disconnected_-2_3');
    }));
    it('should highlight winning coords', fakeAsync(async() => {
        const board: number[][] = [
            [O, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, X],
        ];
        const state: SixState = SixState.fromRepresentation(board, 42);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#piece_0_0');
        const move: SixMove = SixMove.fromMovement(new Coord(0, 0), new Coord(-1, 1));
        await componentTestUtils.expectMoveSuccess('#neighbor_-1_1', move);
        componentTestUtils.expectElementToExist('#victoryCoord_0_0');
        componentTestUtils.expectElementToExist('#victoryCoord_5_0');
    }));
    it('should show as disconnected opponent lastDrop if he is dumb enough to do that', fakeAsync(async() => {
        const board: NumberTable = [
            [O, _, O],
            [X, _, O],
            [O, O, X],
            [X, _, _],
        ];
        const state: SixState = SixState.fromRepresentation(board, 40);
        componentTestUtils.setupState(state);

        // Choosing piece
        await componentTestUtils.expectClickSuccess('#piece_1_2');

        // Choosing landing space
        await componentTestUtils.expectClickSuccess('#neighbor_2_3');
        const move: SixMove = SixMove.fromCut(new Coord(1, 2), new Coord(2, 3), new Coord(0, 0));
        await componentTestUtils.expectMoveSuccess('#piece_0_0', move);
        componentTestUtils.expectElementToExist('#disconnected_2_0');
        componentTestUtils.expectElementToExist('#disconnected_2_1');
        componentTestUtils.expectElementToExist('#disconnected_2_2');
        componentTestUtils.expectElementToExist('#disconnected_2_3');
    }));
    it('should cancel move when clicking on piece before 40th turn', fakeAsync(async() => {
        await componentTestUtils.expectClickFailure('#piece_0_0', SixFailure.NO_MOVEMENT_BEFORE_TURN_40());
    }));
    it('should cancel move when clicking on empty space as first click after 40th turn', fakeAsync(async() => {
        const board: NumberTable = [
            [O],
            [X],
            [O],
            [X],
            [O],
            [X],
        ];
        const state: SixState = SixState.fromRepresentation(board, 40);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickFailure('#neighbor_1_1', SixFailure.CAN_NO_LONGER_DROP());
    }));
    it('should still allow to click on opponent piece after 40th as a third click', fakeAsync(async() => {
        const board: NumberTable = [
            [O],
            [X],
            [O],
            [X],
            [O],
            [X],
        ];
        const state: SixState = SixState.fromRepresentation(board, 40);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#piece_0_2');
        await componentTestUtils.expectClickSuccess('#neighbor_0_-1');
        const move: SixMove = SixMove.fromCut(new Coord(0, 2), new Coord(0, -1), new Coord(0, 1));
        await componentTestUtils.expectMoveSuccess('#piece_0_1', move);
    }));
    it('should cancel the move if player clicks on an empty space instead of chosing a group for cutting', fakeAsync(async() => {
        // Given that a cuttable group must be selected by the user
        const board: NumberTable = [
            [O],
            [X],
            [O],
            [X],
            [O],
            [X],
        ];
        const state: SixState = SixState.fromRepresentation(board, 40);
        componentTestUtils.setupState(state);
        await componentTestUtils.expectClickSuccess('#piece_0_2');
        await componentTestUtils.expectClickSuccess('#neighbor_0_-1');
        // when the user clicks on an empty space instead of selecting a group
        // then the move is cancelled and the board is back to its initial state
        await componentTestUtils.expectClickFailure('#neighbor_1_-1', SixFailure.MUST_CUT());
        componentTestUtils.expectElementToExist('#piece_0_2');
    }));
});
