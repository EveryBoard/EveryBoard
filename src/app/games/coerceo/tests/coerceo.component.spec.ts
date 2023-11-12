/* eslint-disable max-lines-per-function */
import { CoerceoComponent } from '../coerceo.component';
import { CoerceoMove, CoerceoRegularMove, CoerceoTileExchangeMove } from 'src/app/games/coerceo/CoerceoMove';
import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoFailure } from 'src/app/games/coerceo/CoerceoFailure';
import { CoerceoState } from 'src/app/games/coerceo/CoerceoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { CoerceoRules } from '../CoerceoRules';

describe('CoerceoComponent', () => {

    let testUtils: ComponentTestUtils<CoerceoComponent>;

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;

    function expectCoordToBeOfRemovedFill(x: number, y: number): void {
        testUtils.expectElementToHaveClass('#space_' + x + '_' + y, 'captured-alternate-fill');
    }
    function expectCoordToBeOfCapturedFill(x: number, y: number): void {
        testUtils.expectElementToHaveClass('#pyramid_' + x + '_' + y, 'captured-fill');
    }
    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<CoerceoComponent>('Coerceo');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    describe('visual features', () => {
        it('should show tile when more than zero', fakeAsync(async() => {
            const board: Table<FourStatePiece> = CoerceoRules.get().getInitialState().getCopiedBoard();
            const state: CoerceoState = new CoerceoState(board, 0, [1, 0], [0, 0]);
            testUtils.expectElementNotToExist('#tilesCount0');
            await testUtils.setupState(state);
            testUtils.expectElementToExist('#tilesCount0');
        }));
        it('should show removed tiles, and captured piece (after tiles exchange)', fakeAsync(async() => {
            // Given a board with just removed pieces
            const previousBoard: Table<FourStatePiece> = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, _, O, _, N, N, N],
                [N, N, N, N, N, N, X, O, X, _, _, _, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            ];
            const board: Table<FourStatePiece> = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, X, O, _, N, N, N],
                [N, N, N, N, N, N, X, _, X, _, _, _, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            ];
            const previousState: CoerceoState = new CoerceoState(previousBoard, 2, [2, 0], [0, 0]);
            const state: CoerceoState = new CoerceoState(board, 3, [0, 0], [1, 0]);
            const previousMove: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(8, 6));

            // When rendering the board
            await testUtils.setupState(state, previousState, previousMove);

            // Then we should see removed tiles
            expectCoordToBeOfCapturedFill(8, 6);
            expectCoordToBeOfRemovedFill(7, 6);
            expectCoordToBeOfRemovedFill(6, 6);
            expectCoordToBeOfRemovedFill(8, 7);
            expectCoordToBeOfRemovedFill(7, 7);
            expectCoordToBeOfRemovedFill(6, 7);
            testUtils.expectElementToExist('#tilesCount0');
            testUtils.expectElementNotToExist('#tilesCount1');
        }));
        it('should show removed tiles, and captured piece (after movement)', fakeAsync(async() => {
            // Given a board with just removed pieces
            const previousBoard: Table<FourStatePiece> = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, O, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, _, O, _, N, N, N],
                [N, N, N, N, N, N, X, _, _, _, _, _, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            ];
            const board: Table<FourStatePiece> = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, O, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            ];
            const previousState: CoerceoState = new CoerceoState(previousBoard, 2, [0, 0], [0, 0]);
            const previousMove: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(8, 6));
            const state: CoerceoState = new CoerceoState(board, 3, [0, 0], [1, 0]);

            // When rendering the board
            await testUtils.setupState(state, previousState, previousMove);

            // Then we should see removed tiles
            expectCoordToBeOfCapturedFill(8, 6);
            expectCoordToBeOfRemovedFill(10, 7);
        }));
    });
    describe('First click', () => {
        it('should refuse tiles exchange when player have no tiles', fakeAsync(async() => {
            // Given a board without tiles (the initial one here)
            // When clicking on an opponent piece
            // Then the move should fail
            const move: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(6, 9));
            await testUtils.expectMoveFailure('#click_6_9',
                                              CoerceoFailure.NOT_ENOUGH_TILES_TO_EXCHANGE(),
                                              move);
        }));
        it('should show possibles destination after choosing your own piece', fakeAsync(async() => {
            // Given any board
            // When clicking on any piece
            await testUtils.expectClickSuccess('#click_6_2');

            // Then its destinations should be displayed
            const component: CoerceoComponent = testUtils.getGameComponent();
            testUtils.expectElementToHaveClass('#selected_6_2', 'selected-stroke');
            expect(component.possibleLandings.length).toBe(4);
            expect(component.possibleLandings).toContain(new Coord(7, 1));
            expect(component.possibleLandings).toContain(new Coord(7, 3));
            expect(component.possibleLandings).toContain(new Coord(5, 3));
            expect(component.possibleLandings).toContain(new Coord(4, 2));
        }));
        it('should cancelMove when first click is on empty space', fakeAsync(async() => {
            // Given any board
            // When clicking on empty space
            // Then it should have been a failure
            await testUtils.expectClickFailure('#click_5_5', CoerceoFailure.FIRST_CLICK_SHOULD_NOT_BE_NULL());
        }));
        it('should hide last move when selecting first piece', fakeAsync(async() => {
            // Given a state with a last move
            await testUtils.expectClickSuccess('#click_6_2');
            const move: CoerceoMove = CoerceoRegularMove.of(new Coord(6, 2), new Coord(7, 3));
            await testUtils.expectMoveSuccess('#click_7_3', move);

            // When clicking on the piece to move
            await testUtils.expectClickSuccess('#click_4_3');

            // Then the last move should no longer be displayed
            testUtils.expectElementNotToExist('#last_start_6_2');
            testUtils.expectElementNotToExist('#last_end_7_3');
        }));
    });
    describe('Second click', () => {
        it('should allow simple move', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#click_6_2');
            const move: CoerceoMove = CoerceoRegularMove.of(new Coord(6, 2), new Coord(7, 3));
            await testUtils.expectMoveSuccess('#click_7_3', move);
        }));
        it('should switch of selected piece when clicking another player piece', fakeAsync(async() => {
            // Given a board where a first piece has been selected
            await testUtils.expectClickSuccess('#click_6_2');

            // When clicking on another piece
            await testUtils.expectClickSuccess('#click_8_2');

            // Then second piece should be selected
            const component: CoerceoComponent = testUtils.getGameComponent();
            testUtils.expectElementNotToExist('#selected_6_2');
            testUtils.expectElementToHaveClass('#selected_8_2', 'selected-stroke');
            expect(component.possibleLandings).toContain(new Coord(7, 1));
            expect(component.possibleLandings).toContain(new Coord(7, 3));
            expect(component.possibleLandings).not.toContain(new Coord(5, 3));
            expect(component.possibleLandings).not.toContain(new Coord(4, 2));
            expect(component.possibleLandings).toContain(new Coord(10, 2));
            expect(component.possibleLandings).toContain(new Coord(9, 3));
        }));
        it('should deselect piece when clicking a second time on it', fakeAsync(async() => {
            // Given a board on which a piece is selected
            await testUtils.expectClickSuccess('#click_6_2');

            // When clicking on it again
            await testUtils.expectClickSuccess('#click_6_2');

            // Then the different highlights should be gone since the piece is deselected
            const component: CoerceoComponent = testUtils.getGameComponent();
            testUtils.expectElementNotToExist('#selected_6_2');
            expect(component.possibleLandings.length).toBe(0);
        }));
        it('should refuse invalid movement', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#click_6_2');
            await testUtils.expectClickFailure('#click_8_4', CoerceoFailure.INVALID_DISTANCE());
        }));
        it('should show last move after finishing it', fakeAsync(async() => {
            // Given a state with a move ongoing
            await testUtils.expectClickSuccess('#click_6_2');

            // When finishing the move
            const move: CoerceoMove = CoerceoRegularMove.of(new Coord(6, 2), new Coord(7, 3));
            await testUtils.expectMoveSuccess('#click_7_3', move);

            // Then the highlight of the last move should be present
            testUtils.expectElementToHaveClass('#last_start_6_2', 'last-move-stroke');
            testUtils.expectElementToHaveClass('#last_end_7_3', 'last-move-stroke');
        }));
    });
    describe('showLastMove', () => {
        it('should work for tile exchange', fakeAsync(async() => {
            // Given a board where last move was a piece move
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, [0, 2], [0, 0]);
            await testUtils.setupState(state, undefined, CoerceoRegularMove.of(new Coord(8, 9), new Coord(6, 9)));
            testUtils.expectElementToHaveClasses('#last_end_6_9', ['base', 'no-fill', 'mid-stroke', 'last-move-stroke']);
            testUtils.expectElementToHaveClasses('#last_start_8_9', ['base', 'no-fill', 'mid-stroke', 'last-move-stroke']);

            // When applying a tile exchange
            await testUtils.expectMoveSuccess('#click_6_9',
                                              CoerceoTileExchangeMove.of(new Coord(6, 9)));

            // Then the start and end of penultimate move should be gone
            testUtils.expectElementNotToExist('#last_end_6_9');
            testUtils.expectElementNotToExist('#last_start_8_9');
            testUtils.expectElementToHaveClass('#pyramid_6_9', 'captured-fill');
        }));
    });
});
