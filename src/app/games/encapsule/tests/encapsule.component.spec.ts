/* eslint-disable max-lines-per-function */
import { EncapsuleComponent } from '../encapsule.component';
import { EncapsuleMove } from 'src/app/games/encapsule/EncapsuleMove';
import { Coord } from 'src/app/jscaip/Coord';
import { EncapsuleSpace, EncapsuleState } from 'src/app/games/encapsule/EncapsuleState';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { EncapsulePiece } from 'src/app/games/encapsule/EncapsulePiece';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { EncapsuleFailure } from '../EncapsuleFailure';

describe('EncapsuleComponent', () => {

    let testUtils: ComponentTestUtils<EncapsuleComponent>;

    const _: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
    const emptyBoard: EncapsuleSpace[][] = [
        [_, _, _],
        [_, _, _],
        [_, _, _],
    ];
    const P0Turn: number = 6;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<EncapsuleComponent>('Encapsule');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('First click', () => {

        it('should forbid clicking directly on the board without selecting a piece', fakeAsync(async() => {
            await testUtils.expectClickFailure('#click-0-0', EncapsuleFailure.INVALID_PIECE_SELECTED());
        }));

        it('should forbid selecting a piece that is not remaining', fakeAsync(async() => {
            await testUtils.setupState(new EncapsuleState(emptyBoard, P0Turn, []));

            testUtils.expectElementNotToExist('#piece-PLAYER_ZERO-SMALL_DARK-0');
        }));

        it('should forbid selecting a piece from the other player', fakeAsync(async() => {
            await testUtils.setupState(new EncapsuleState(emptyBoard, P0Turn, [EncapsulePiece.SMALL_LIGHT]));

            await testUtils.expectClickFailure('#piece-PLAYER_ONE-SMALL_LIGHT-0', EncapsuleFailure.NOT_DROPPABLE());
        }));

        it('should forbid moving from a space that the player is not controlling', fakeAsync(async() => {
            const x: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, Player.ONE, PlayerOrNone.NONE);
            const board: EncapsuleSpace[][] = [
                [_, _, _],
                [x, _, _],
                [_, _, _],
            ];
            await testUtils.setupState(new EncapsuleState(board, P0Turn, []));

            await testUtils.expectClickFailure('#click-0-1', EncapsuleFailure.INVALID_PIECE_SELECTED());
        }));

        it('should select remaining piece that you clicked', fakeAsync(async() => {
            // Given any state with remaining pieces
            // When clicking on one of them
            await testUtils.expectClickSuccess('#piece-PLAYER_ZERO-SMALL_DARK-5');

            // Then that piece should be selected
            testUtils.expectElementToHaveClass('#piece-PLAYER_ZERO-SMALL_DARK-5', 'selected-stroke');
        }));

        it('should select starting coord when clicking on occupied coord', fakeAsync(async() => {
            // Given a board on which one piece is owned by current player
            const x: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, Player.ONE, PlayerOrNone.NONE);
            const board: EncapsuleSpace[][] = [
                [_, _, _],
                [x, _, _],
                [_, _, _],
            ];
            await testUtils.setupState(new EncapsuleState(board, 1, []));

            // When clicking on this coord
            await testUtils.expectClickSuccess('#click-0-1');

            // Then it should be selected
            testUtils.expectElementToExist('#chosen-0-1');
        }));

    });

    describe('Second click', () => {

        it('should drop a piece on the board when selecting it and dropping it', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#piece-PLAYER_ZERO-SMALL_DARK-5');

            const move: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 0));
            await testUtils.expectMoveSuccess('#click-0-0', move);
        }));

        it('should allow dropping a piece on a smaller one', fakeAsync(async() => {
            const x: EncapsuleSpace = new EncapsuleSpace(Player.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            const board: EncapsuleSpace[][] = [
                [_, _, _],
                [x, _, _],
                [_, _, _],
            ];
            await testUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.MEDIUM_DARK]));
            await testUtils.expectClickSuccess('#piece-PLAYER_ZERO-MEDIUM_DARK-0');

            const move: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.MEDIUM_DARK, new Coord(0, 1));
            await testUtils.expectMoveSuccess('#click-0-1', move);
        }));

        it('should forbid dropping a piece on a bigger one', fakeAsync(async() => {
            const x: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, Player.ONE, PlayerOrNone.NONE);
            const board: EncapsuleSpace[][] = [
                [_, _, _],
                [x, _, _],
                [_, _, _],
            ];
            await testUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.SMALL_DARK]));
            await testUtils.expectClickSuccess('#piece-PLAYER_ZERO-SMALL_DARK-0');

            const move: EncapsuleMove = EncapsuleMove.ofDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 1));
            await testUtils.expectMoveFailure('#click-0-1', EncapsuleFailure.INVALID_PLACEMENT(), move);
        }));

        it('should move a piece when clicking on the piece and clicking on its destination coord', fakeAsync(async() => {
            const x: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
            const board: EncapsuleSpace[][] = [
                [_, _, _],
                [x, _, _],
                [_, _, _],
            ];
            await testUtils.setupState(new EncapsuleState(board, P0Turn, []));

            await testUtils.expectClickSuccess('#click-0-1');

            const move: EncapsuleMove = EncapsuleMove.ofMove(new Coord(0, 1), new Coord(0, 2));
            await testUtils.expectMoveSuccess('#click-0-2', move);
        }));

        it('should allow moving a piece on top of a smaller one', fakeAsync(async() => {
            // Given a board with a selected piece movable on top of another one
            const x: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
            const X: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, Player.ZERO);
            const board: EncapsuleSpace[][] = [
                [_, _, _],
                [x, X, _],
                [_, _, _],
            ];
            await testUtils.setupState(new EncapsuleState(board, P0Turn, []));
            await testUtils.expectClickSuccess('#click-1-1');

            // When moving the big piece atop the small one
            const move: EncapsuleMove = EncapsuleMove.ofMove(new Coord(1, 1), new Coord(0, 1));

            // Then it shoud work and the starting and landing coord should be "moved-fill"
            await testUtils.expectMoveSuccess('#click-0-1', move);
            testUtils.expectElementToHaveClasses('#click-0-1', ['base', 'moved-fill']);
            testUtils.expectElementToHaveClasses('#click-1-1', ['base', 'moved-fill']);
        }));

        it('should forbid moving a piece on top of a bigger one', fakeAsync(async() => {
            const x: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
            const X: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, Player.ZERO);
            const board: EncapsuleSpace[][] = [
                [_, _, _],
                [x, X, _],
                [_, _, _],
            ];
            await testUtils.setupState(new EncapsuleState(board, P0Turn, []));

            await testUtils.expectClickSuccess('#click-0-1');

            const move: EncapsuleMove = EncapsuleMove.ofMove(new Coord(0, 1), new Coord(1, 1));
            await testUtils.expectMoveFailure('#click-1-1', EncapsuleFailure.INVALID_PLACEMENT(), move);
        }));

        it('should forbid selecting a remaining piece when a move is being constructed', fakeAsync(async() => {
            const x: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
            const board: EncapsuleSpace[][] = [
                [_, _, _],
                [x, _, _],
                [_, _, _],
            ];
            await testUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.SMALL_DARK]));

            await testUtils.expectClickSuccess('#click-0-1');

            await testUtils.expectClickFailure('#piece-PLAYER_ZERO-SMALL_DARK-0', EncapsuleFailure.END_YOUR_MOVE());
        }));

        it('should deselect piece when clicking a second time on it', fakeAsync(async() => {
            // Given any state with a remaining pieces selected
            await testUtils.expectClickSuccess('#piece-PLAYER_ZERO-SMALL_DARK-5');

            // When clicking on it again
            await testUtils.expectClickFailure('#piece-PLAYER_ZERO-SMALL_DARK-5');

            // Then that piece should be selected no more
            testUtils.expectElementNotToHaveClass('#piece-PLAYER_ZERO-SMALL_DARK-5', 'selected-stroke');
        }));

        it('should change select piece when clicking another', fakeAsync(async() => {
            // Given any state with a remaining pieces selected
            await testUtils.expectClickSuccess('#piece-PLAYER_ZERO-SMALL_DARK-5');

            // When clicking on another one
            await testUtils.expectClickSuccess('#piece-PLAYER_ZERO-SMALL_DARK-4');

            // Then that other piece should be selected
            testUtils.expectElementNotToHaveClass('#piece-PLAYER_ZERO-SMALL_DARK-5', 'selected-stroke');
            testUtils.expectElementToHaveClass('#piece-PLAYER_ZERO-SMALL_DARK-4', 'selected-stroke');
        }));

        it('should deselect starting coord when clicking on it again', fakeAsync(async() => {
            // Given a board on which one piece is owned by current player and one is selected
            const x: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, Player.ONE, PlayerOrNone.NONE);
            const board: EncapsuleSpace[][] = [
                [_, _, _],
                [x, _, _],
                [_, _, _],
            ];
            await testUtils.setupState(new EncapsuleState(board, 1, []));
            await testUtils.expectClickSuccess('#click-0-1');

            // When clicking on this coord again
            await testUtils.expectClickFailure('#click-0-1');

            // Then it should no longer be selected, and component should not throw
            testUtils.expectElementNotToExist('#chosen-0-1');
        }));

    });

    it('should display victory highlight', fakeAsync(async() => {
        // Given a board with a victory
        const x: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, Player.ONE, PlayerOrNone.NONE);
        const board: EncapsuleSpace[][] = [
            [x, _, _],
            [_, x, _],
            [_, _, x],
        ];
        // When displaying it

        await testUtils.setupState(new EncapsuleState(board, 1, []));

        // Then the victory coords should be highlighted
        testUtils.expectElementToExist('#victory-0-0');
        testUtils.expectElementToExist('#victory-1-1');
        testUtils.expectElementToExist('#victory-2-2');
        // And other coords should not be highlighted
        testUtils.expectElementNotToExist('#victory-1-0');
        testUtils.expectElementNotToExist('#victory-2-0');
        testUtils.expectElementNotToExist('#victory-0-1');
        testUtils.expectElementNotToExist('#victory-2-1');
        testUtils.expectElementNotToExist('#victory-0-2');
        testUtils.expectElementNotToExist('#victory-1-2');
    }));

});
