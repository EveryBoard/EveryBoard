/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/jscaip/TableUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { AbaloneComponent } from '../abalone.component';
import { AbaloneFailure } from '../AbaloneFailure';
import { AbaloneState } from '../AbaloneState';
import { AbaloneMove } from '../AbaloneMove';

describe('AbaloneComponent', () => {

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    let testUtils: ComponentTestUtils<AbaloneComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<AbaloneComponent>('Abalone');
    }));

    describe('first click', () => {

        it('should show legal directions choice when clicking piece', fakeAsync(async() => {
            // Given the initial board

            // When clicking on a piece
            await testUtils.expectClickSuccess('#piece_1_7');

            // Then highlight and 5 arrows should be shown
            testUtils.expectElementToExist('#direction_LEFT');
            testUtils.expectElementToExist('#direction_UP');
            testUtils.expectElementToExist('#direction_UP_RIGHT');
            testUtils.expectElementToExist('#direction_DOWN');
            testUtils.expectElementToExist('#direction_DOWN_LEFT');
            // And also their more precisely describe part
            testUtils.expectElementToExist('#arrow_1_7_to_1_6');
            testUtils.expectElementToExist('#arrow_1_7_to_-1_7');
            testUtils.expectElementToExist('#arrow_1_7_to_3_5');
            testUtils.expectElementToExist('#arrow_1_7_to_1_9');
            testUtils.expectElementToExist('#arrow_1_7_to_-1_9');

            // As pushing 5 pieces is not allowed, direction right should not be possible
            testUtils.expectElementNotToExist('#direction_RIGHT');
        }));

        it('should cancel move when clicking on opponent piece', fakeAsync(async() => {
            // Given the initial board
            // When clicking on an opponent piece
            // Then it should fail
            await testUtils.expectClickFailure('#piece_8_0');
        }));

        it('should select piece when clicking it', fakeAsync(async() => {
            // Given the initial board
            // When clicking a piece
            await testUtils.expectClickSuccess('#piece_2_7');

            // Then it should be selected
            testUtils.expectElementToHaveClass('#piece_2_7', 'selected-stroke');
        }));

        it('should hide last move when clicking on a piece', fakeAsync(async() => {
            // Given a board with last move
            const previousBoard: FourStatePiece[][] = [
                [N, N, N, N, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _],
                [X, X, O, O, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, N, N],
                [O, O, O, O, O, O, N, N, N],
                [_, O, O, O, O, N, N, N, N],
            ];
            const previousState: AbaloneState = new AbaloneState(previousBoard, 0);
            const previousMove: AbaloneMove = AbaloneMove.ofSingleCoord(new Coord(4, 4), HexaDirection.LEFT);
            const board: FourStatePiece[][] = [
                [N, N, N, N, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _],
                [X, O, O, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, N, N],
                [O, O, O, O, O, O, N, N, N],
                [_, O, O, O, O, N, N, N, N],
            ];
            const state: AbaloneState = new AbaloneState(board, 1);
            await testUtils.setupState(state, { previousState, previousMove });

            // When doing a click
            await testUtils.expectClickSuccess('#space_0_4');

            // Then the previous move should be hidden
            testUtils.expectElementNotToHaveClass('#space_1_4', 'moved-fill');
            testUtils.expectElementNotToHaveClass('#space_2_4', 'moved-fill');
            testUtils.expectElementNotToHaveClass('#space_3_4', 'moved-fill');
            testUtils.expectElementNotToExist('#space_-1_4');
            testUtils.expectElementNotToExist('#piece_-1_4');
        }));

        it('should cancel move when clicking on empty space', fakeAsync(async() => {
            // Given the initial board
            // When clicking on an empty space
            // Then it should fail
            await testUtils.expectClickFailure('#space_3_3', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }));

    });

    describe('second click', () => {

        it('should show translation and pushings directions when second piece is clicked', fakeAsync(async() => {
            // Given the initial board with one selected piece
            await testUtils.expectClickSuccess('#piece_2_6');

            // When clicking on the second
            await testUtils.expectClickSuccess('#piece_4_6');

            // Then legal direction should be shown and others not
            testUtils.expectElementToExist('#direction_LEFT');
            testUtils.expectElementToExist('#direction_UP');
            testUtils.expectElementToExist('#direction_UP_RIGHT');
            testUtils.expectElementToExist('#direction_RIGHT');

            testUtils.expectElementNotToExist('#direction_DOWN_LEFT');
            testUtils.expectElementNotToExist('#direction_DOWN');
        }));

        it('should unselect single piece when reclicking it', fakeAsync(async() => {
            // Given the initial board with a selected piece
            await testUtils.expectClickSuccess('#piece_2_7');

            // When reclicking it
            await testUtils.expectClickFailure('#piece_2_7');

            // Then it should no longer be selected
            testUtils.expectElementNotToHaveClass('#piece_2_7', 'selected-stroke');
        }));

        it('should select clicked piece when second clicked piece is not aligned with first (non dir)', fakeAsync(async() => {
            // Given the initial board with a selected piece
            await testUtils.expectClickSuccess('#piece_2_6');

            // When clicking second unaligned piece
            await testUtils.expectClickSuccess('#piece_4_7');

            // Then the first piece should be unselected and the second one should be selected
            testUtils.expectElementNotToHaveClass('#piece_2_6', 'selected-stroke');
            testUtils.expectElementToHaveClass('#piece_4_7', 'selected-stroke');
        }));

        it('should select clicked piece when not aligned with first (non hexa dir)', fakeAsync(async() => {
            // Given the initial board with first click
            await testUtils.expectClickSuccess('#piece_2_6');

            // When clicking second unaligned coord
            await testUtils.expectClickSuccess('#piece_3_7');

            // Then the first piece should be unselected and the second one should be selected
            testUtils.expectElementNotToHaveClass('#piece_2_6', 'selected-stroke');
            testUtils.expectElementToHaveClass('#piece_3_7', 'selected-stroke');
        }));

        it('should change first coord to clicked coord if valid extension side but hole in the extension', fakeAsync(async() => {
            // Given a board with a possible "holed line" selection and a first piece selected that could lead to it
            const board: Table<FourStatePiece> = [
                [N, N, N, N, X, X, X, X, X],
                [N, N, N, X, X, X, X, X, X],
                [N, N, _, _, X, X, X, _, _],
                [N, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, O, _, _, _, _, _, _, N],
                [_, _, _, O, O, _, _, N, N],
                [O, O, O, O, O, O, N, N, N],
                [O, O, O, O, O, N, N, N, N],
            ];
            const state: AbaloneState = new AbaloneState(board, 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#piece_1_5');

            // When choosing the piece that is aligned and at good distance but not making a line
            await testUtils.expectClickSuccess('#piece_1_7');

            // Then the old piece should be unselected and the new one selected
            testUtils.expectElementNotToHaveClass('#piece_1_5', 'selected-stroke');
            testUtils.expectElementToHaveClass('#piece_1_7', 'selected-stroke');
        }));

        it('should cancel move when trying to select more than three pieces', fakeAsync(async() => {
            // Given the initial board with one piece selected
            await testUtils.expectClickSuccess('#piece_0_7');

            // When clicking 3 space on the right
            await testUtils.expectClickFailure('#piece_3_7', AbaloneFailure.CANNOT_MOVE_MORE_THAN_THREE_PIECES());

            // Then piece should no longer be selected
            testUtils.expectElementNotToHaveClass('#piece_0_7', 'selected-stroke');
            testUtils.expectElementNotToHaveClass('#piece_1_7', 'selected-stroke');
            testUtils.expectElementNotToHaveClass('#piece_2_7', 'selected-stroke');
            testUtils.expectElementNotToHaveClass('#piece_3_7', 'selected-stroke');
        }));

        it('should select piece in the middle when clicking on two distant pieces', fakeAsync(async() => {
            // Given the initial board with one selected coord
            await testUtils.expectClickSuccess('#piece_2_7');

            // When clicking first coord then third coord
            await testUtils.expectClickSuccess('#piece_4_7');

            // Then three pieces should be selected
            testUtils.expectElementToHaveClass('#piece_2_7', 'selected-stroke');
            testUtils.expectElementToHaveClass('#piece_3_7', 'selected-stroke');
            testUtils.expectElementToHaveClass('#piece_4_7', 'selected-stroke');
        }));

        it('should allow clicking on arrow landing coord as if it was the arrow (space)', fakeAsync(async() => {
            // Given the initial board with first space clicked
            await testUtils.expectClickSuccess('#piece_2_6');

            // When clicking on the space marked by the direction instead of its arrow
            // Then the move should succeed
            const move: AbaloneMove = AbaloneMove.ofSingleCoord(new Coord(2, 6), HexaDirection.LEFT);
            await testUtils.expectMoveSuccess('#space_1_6', move);
        }));

        it('should do move when clicking direction', fakeAsync(async() => {
            // Given the initial board with piece selected
            await testUtils.expectClickSuccess('#piece_0_7');

            // When clicking on coord then direction
            // Then the move should succeed
            const move: AbaloneMove = AbaloneMove.ofSingleCoord(new Coord(0, 7), HexaDirection.UP);
            await testUtils.expectMoveSuccessWithAsymmetricNaming('#arrow_0_7_to_0_6', '#direction_UP', move);
        }));

        it('should choose the more inclusive arrow-drawing (A > B)', fakeAsync(async() => {
            // Given any board with two neighbor pieces, able to move in one direction but not its opposite
            // When selecting the one "first" in that direction, then the "second"
            await testUtils.expectClickSuccess('#piece_1_7');
            await testUtils.expectClickSuccess('#piece_2_6');

            // Then the arrow path should includes both spaces
            testUtils.expectElementToExist('#arrow_1_7_to_3_5');
            // And there should be a healthy line starting from first selected coord
            testUtils.expectElementToExist('#arrow_1_7_to_1_6');
        }));

        it('should choose the more inclusive arrow-drawing (B > A)', fakeAsync(async() => {
            // Given any board with two neighbor pieces, able to move in one direction but not its opposite
            // When selecting the one "second" in that direction, then the "first"
            await testUtils.expectClickSuccess('#piece_2_6');
            await testUtils.expectClickSuccess('#piece_1_7');

            // Then the arrow path should includes both spaces
            testUtils.expectElementToExist('#arrow_1_7_to_3_5');
            // And there should be a healthy line starting from first selected coord
            testUtils.expectElementToExist('#arrow_2_6_to_2_5');
        }));

    });

    describe('third click', () => {

        it('should deselect first piece only when reclicked, and change it', fakeAsync(async() => {
            // Given the initial board with 2 pieces selected
            await testUtils.expectClickSuccess('#piece_2_6');
            await testUtils.expectClickSuccess('#piece_3_6');

            // When clicking first piece
            await testUtils.expectClickSuccess('#piece_2_6');

            // Then only one piece should be selected
            testUtils.expectElementNotToHaveClass('#piece_2_6', 'selected-stroke');
            testUtils.expectElementToHaveClass('#piece_3_6', 'selected-stroke');
        }));

        it('should deselect last piece selected when reclicked', fakeAsync(async() => {
            // Given the initial board with 2 pieces selected
            await testUtils.expectClickSuccess('#piece_2_6');
            await testUtils.expectClickSuccess('#piece_3_6');

            // When clicking first piece
            await testUtils.expectClickSuccess('#piece_3_6');

            // Then only one piece should be selected
            testUtils.expectElementToHaveClass('#piece_2_6', 'selected-stroke');
            testUtils.expectElementNotToHaveClass('#piece_3_6', 'selected-stroke');
        }));

        it('should cancel move when clicking middle piece of a 3 piece column and selecting middle', fakeAsync(async() => {
            // Given the initial board with three piece selected
            await testUtils.expectClickSuccess('#piece_2_7');
            await testUtils.expectClickSuccess('#piece_4_7');

            // When reclicking middle one
            await testUtils.expectClickFailure('#piece_3_7');

            // Then all three pieces should be unselected
            testUtils.expectElementNotToHaveClass('#piece_2_7', 'selected-stroke');
            testUtils.expectElementNotToHaveClass('#piece_3_7', 'selected-stroke');
            testUtils.expectElementNotToHaveClass('#piece_4_7', 'selected-stroke');
        }));

        it('should cancel move then select clicked piece as first piece when it is not aligned with first piece', fakeAsync(async() => {
            // Given the initial board with a line selected
            await testUtils.expectClickSuccess('#piece_2_6');
            await testUtils.expectClickSuccess('#piece_4_6');

            // When clicking on not aligned piece
            // Then it should fail
            await testUtils.expectClickFailure('#piece_4_7', AbaloneFailure.LINE_AND_COORD_NOT_ALIGNED());
        }));

        it('should cancel move then select clicked piece as first piece when it is not aligned with second piece', fakeAsync(async() => {
            // Given the initial board with a line selected
            await testUtils.expectClickSuccess('#piece_2_6');
            await testUtils.expectClickSuccess('#piece_4_6');

            // When clicking on not aligned piece
            // Then it should fail
            await testUtils.expectClickFailure('#piece_2_7', AbaloneFailure.LINE_AND_COORD_NOT_ALIGNED());
        }));

        it('should recognize line extension and show new directions (1-2-3)', fakeAsync(async() => {
            // Given the initial board with an extendable two pieces line selected
            await testUtils.expectClickSuccess('#piece_2_6');
            await testUtils.expectClickSuccess('#piece_3_6');

            // When clicking third one
            await testUtils.expectClickSuccess('#piece_4_6');

            // Then three pieces should be selected
            testUtils.expectElementToHaveClass('#piece_2_6', 'selected-stroke');
            testUtils.expectElementToHaveClass('#piece_3_6', 'selected-stroke');
            testUtils.expectElementToHaveClass('#piece_4_6', 'selected-stroke');
        }));

        it('should refuse too long extension', fakeAsync(async() => {
            // Given the initial board with two space selected
            await testUtils.expectClickSuccess('#piece_0_7');
            await testUtils.expectClickSuccess('#piece_1_7');

            // When selecting an aligned piece too far
            // Then move should be cancel for "too-long-line" reason
            await testUtils.expectClickFailure('#piece_3_7', AbaloneFailure.CANNOT_MOVE_MORE_THAN_THREE_PIECES());
        }));

        it('should allow clicking on arrow landing coord as if it was below an arrow (opponent)', fakeAsync(async() => {
            // Given a board with a possible push
            const board: Table<FourStatePiece> = [
                [N, N, N, N, X, X, X, X, X],
                [N, N, N, X, X, X, X, X, X],
                [N, N, _, _, _, X, X, _, _],
                [N, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, X, _, _, _, _, _, N],
                [_, _, O, O, O, _, _, N, N],
                [O, O, O, O, O, O, N, N, N],
                [O, O, O, O, O, N, N, N, N],
            ];
            const state: AbaloneState = new AbaloneState(board, 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#piece_2_6');
            await testUtils.expectClickSuccess('#piece_2_7');

            // When clicking on the space marked by the direction instead of its arrow
            // Then the move should succeed
            const move: AbaloneMove = AbaloneMove.ofSingleCoord(new Coord(2, 7), HexaDirection.UP);
            await testUtils.expectMoveSuccess('#piece_2_5', move);
        }));

    });

    it('should allow clicking on arrow landing coord as if it was the arrow (space)', fakeAsync(async() => {
        // Given the initial board with first space clicked
        await testUtils.expectClickSuccess('#piece_2_6');

        // When clicking on the space marked by the direction instead of its arrow
        // Then the move should succeed
        const move: AbaloneMove = AbaloneMove.ofSingleCoord(new Coord(2, 6), HexaDirection.LEFT);
        await testUtils.expectMoveSuccess('#space_1_6', move);
    }));

    describe('showLastMove', () => {

        it('should show last move moved pieces (translation)', fakeAsync(async() => {
            // Given an initial board with two aligned pieces selected
            await testUtils.expectClickSuccess('#piece_2_6');
            await testUtils.expectClickSuccess('#piece_3_6');

            // When clicking the direction
            // Then the translation move should be done
            const move: AbaloneMove =
                AbaloneMove.ofDoubleCoord(new Coord(2, 6), new Coord(3, 6), HexaDirection.UP);
            await testUtils.expectMoveSuccessWithAsymmetricNaming('#arrow_2_6_to_2_5', '#direction_UP', move);
        }));

        it('should show last move moved pieces (push)', fakeAsync(async() => {
            // Given a board with a previous move
            await testUtils.expectClickSuccess('#piece_0_7');
            await testUtils.expectClickSuccess('#piece_0_8');
            const move: AbaloneMove = AbaloneMove.ofSingleCoord(new Coord(0, 7), HexaDirection.DOWN);
            await testUtils.expectMoveSuccessWithAsymmetricNaming('#arrow_0_7_to_0_9', '#direction_DOWN', move);

            // When rendering it
            // Then the starting square of the moved piece should be shown as moved
            testUtils.expectElementToHaveClass('#space_0_7', 'moved-fill');
            testUtils.expectElementToHaveClass('#space_0_8', 'moved-fill');
        }));

        it('should recognize line extension and show new directions (M-2-1-3) and move it as one', fakeAsync(async() => {
            // Given the initial board with an extendable two pieces line selected
            await testUtils.expectClickSuccess('#piece_3_6');
            await testUtils.expectClickSuccess('#piece_2_6');

            // When clicking third one then moving them
            await testUtils.expectClickSuccess('#piece_4_6');
            const move: AbaloneMove = AbaloneMove.ofSingleCoord(new Coord(4, 6), HexaDirection.LEFT);
            await testUtils.expectMoveSuccessWithAsymmetricNaming('#arrow_4_6_to_1_6', '#direction_LEFT', move);

            // Then four spaces should be moved
            testUtils.expectElementToHaveClass('#space_1_6', 'moved-fill');
            testUtils.expectElementToHaveClass('#space_2_6', 'moved-fill');
            testUtils.expectElementToHaveClass('#space_3_6', 'moved-fill');
            testUtils.expectElementToHaveClass('#space_4_6', 'moved-fill');
        }));

        it('should show pushed out pieces', fakeAsync(async() => {
            // Given any board where a piece has been thrown out of the board last turn
            const previousBoard: FourStatePiece[][] = [
                [N, N, N, N, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _],
                [X, X, O, O, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, N, N],
                [O, O, O, O, O, O, N, N, N],
                [_, O, O, O, O, N, N, N, N],
            ];
            const previousState: AbaloneState = new AbaloneState(previousBoard, 0);
            const previousMove: AbaloneMove = AbaloneMove.ofSingleCoord(new Coord(4, 4), HexaDirection.LEFT);
            const board: FourStatePiece[][] = [
                [N, N, N, N, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _],
                [X, O, O, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, N, N],
                [O, O, O, O, O, O, N, N, N],
                [_, O, O, O, O, N, N, N, N],
            ];
            const state: AbaloneState = new AbaloneState(board, 1);

            // When displaying it
            await testUtils.setupState(state, { previousState, previousMove });

            // Then a "captured" square with the pushed-out piece should be shown
            testUtils.expectElementToHaveClass('#space_-1_4', 'captured-fill');
            testUtils.expectElementToHaveClass('#piece_-1_4', 'player1-fill');
        }));

        it('should show suicidal-translation fallen pieces', fakeAsync(async() => {
            // Given any board where one or several pieces has been thrown out of the board last turn by their owner
            const previousBoard: FourStatePiece[][] = [
                [N, N, N, N, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _],
                [X, X, O, O, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, N, N],
                [O, O, O, O, O, O, N, N, N],
                [_, O, O, O, O, N, N, N, N],
            ];
            const previousState: AbaloneState = new AbaloneState(previousBoard, 1);
            const previousMove: AbaloneMove =
                AbaloneMove.ofDoubleCoord(new Coord(1, 8), new Coord(3, 8), HexaDirection.DOWN);
            const board: FourStatePiece[][] = [
                [N, N, N, N, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _],
                [X, X, O, O, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, N, N],
                [O, O, O, O, O, O, N, N, N],
                [_, _, _, _, O, N, N, N, N],
            ];
            const state: AbaloneState = new AbaloneState(board, 2);

            // When displaying it
            await testUtils.setupState(state, { previousState, previousMove });

            // Then a "captured" square with the pushed-out piece should be shown
            testUtils.expectElementToHaveClass('#space_1_9', 'captured-fill');
            testUtils.expectElementToHaveClass('#piece_1_9', 'player1-fill');
            testUtils.expectElementToHaveClass('#space_2_9', 'captured-fill');
            testUtils.expectElementToHaveClass('#piece_2_9', 'player1-fill');
            testUtils.expectElementToHaveClass('#space_3_9', 'captured-fill');
            testUtils.expectElementToHaveClass('#piece_3_9', 'player1-fill');
        }));

    });

});
