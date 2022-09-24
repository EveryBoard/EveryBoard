/* eslint-disable max-lines-per-function */
import { CoerceoComponent } from '../coerceo.component';
import { CoerceoMove } from 'src/app/games/coerceo/CoerceoMove';
import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoFailure } from 'src/app/games/coerceo/CoerceoFailure';
import { CoerceoState } from 'src/app/games/coerceo/CoerceoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

describe('CoerceoComponent', () => {

    let testUtils: ComponentTestUtils<CoerceoComponent>;

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;

    function getScores(): readonly [number, number] {
        return testUtils.getComponent().scores.get();
    }
    function expectCoordToBeOfRemovedFill(x: number, y: number): void {
        const gameComponent: CoerceoComponent = testUtils.getComponent();
        expect(gameComponent.isEmptyCase(x, y)).toBeTrue();
        expect(gameComponent.getEmptyClass(x, y)).toBe('captured2');
    }
    function expectCoordToBeOfCapturedFill(x: number, y: number): void {
        const gameComponent: CoerceoComponent = testUtils.getComponent();
        expect(gameComponent.isPyramid(x, y)).toBeTrue();
        expect(gameComponent.getPyramidClass(x, y)).toBe('captured');
    }
    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<CoerceoComponent>('Coerceo');
    }));
    it('should create', () => {
        expect(testUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(testUtils.getComponent()).withContext('CoerceoComponent should be created').toBeTruthy();
    });
    describe('visual features', () => {
        it('Should show tile when more than zero', fakeAsync(async() => {
            const board: Table<FourStatePiece> = CoerceoState.getInitialState().getCopiedBoard();
            const state: CoerceoState = new CoerceoState(board, 0, [1, 0], [0, 0]);
            testUtils.expectElementNotToExist('#playerZeroTilesCount');
            testUtils.setupState(state);
            testUtils.expectElementToExist('#playerZeroTilesCount');
        }));
        it('Should show removed tiles, and captured piece (after tiles exchange)', fakeAsync(async() => {
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
            const previousMove: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(8, 6));

            // When rendering the board
            testUtils.setupState(state, previousState, previousMove);

            // Then we should see removed tiles
            expectCoordToBeOfCapturedFill(8, 6);
            expectCoordToBeOfRemovedFill(7, 6);
            expectCoordToBeOfRemovedFill(6, 6);
            expectCoordToBeOfRemovedFill(8, 7);
            expectCoordToBeOfRemovedFill(7, 7);
            expectCoordToBeOfRemovedFill(6, 7);
            testUtils.expectElementToExist('#tilesCountZero');
            testUtils.expectElementNotToExist('#tilesCountOne');
        }));
        it('Should show removed tiles, and captured piece (after movement)', fakeAsync(async() => {
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
            const previousMove: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(8, 6));
            const state: CoerceoState = new CoerceoState(board, 3, [0, 0], [1, 0]);

            // When rendering the board
            testUtils.setupState(state, previousState, previousMove);

            // Then we should see removed tiles
            expectCoordToBeOfCapturedFill(8, 6);
            expectCoordToBeOfRemovedFill(10, 7);
        }));
    });
    describe('first click', () => {
        it('Should accept tiles exchange proposal as first click', fakeAsync(async() => {
            const move: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(6, 9));
            await testUtils.expectMoveFailure('#click_6_9',
                                              CoerceoFailure.NOT_ENOUGH_TILES_TO_EXCHANGE(),
                                              move,
                                              undefined,
                                              getScores());
        }));
        it('Should show possibles destination after choosing your own piece', fakeAsync(async() => {
            // Given any board
            // When clicking on any piece
            await testUtils.expectClickSuccess('#click_6_2');

            // Then its destinations should be displayed
            const component: CoerceoComponent = testUtils.getComponent();
            testUtils.expectElementToHaveClass('#selected_6_2', 'selected');
            expect(component.possibleLandings.length).toBe(4);
            expect(component.possibleLandings).toContain(new Coord(7, 1));
            expect(component.possibleLandings).toContain(new Coord(7, 3));
            expect(component.possibleLandings).toContain(new Coord(5, 3));
            expect(component.possibleLandings).toContain(new Coord(4, 2));
        }));
        it('Should cancelMove when first click is on empty space', fakeAsync(async() => {
            // Given any board
            // When clicking on empty space
            // Then it should have been a failure
            await testUtils.expectClickFailure('#click_5_5', CoerceoFailure.FIRST_CLICK_SHOULD_NOT_BE_NULL());
        }));
    });
    describe('second click', () => {
        it('Should allow simple move', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#click_6_2');
            const move: CoerceoMove = CoerceoMove.fromCoordToCoord(new Coord(6, 2), new Coord(7, 3));
            await testUtils.expectMoveSuccess('#click_7_3', move, undefined, getScores());
        }));
        it('Should switch of selected piece when clicking another player piece', fakeAsync(async() => {
            // Given a board where a first piece has been selected
            await testUtils.expectClickSuccess('#click_6_2');

            // When clicking on another piece
            await testUtils.expectClickSuccess('#click_8_2');

            // Then second piece should be selected
            const component: CoerceoComponent = testUtils.getComponent();
            testUtils.expectElementNotToExist('#selected_6_2');
            testUtils.expectElementToHaveClass('#selected_8_2', 'selected');
            expect(component.possibleLandings).toContain(new Coord(7, 1));
            expect(component.possibleLandings).toContain(new Coord(7, 3));
            expect(component.possibleLandings).not.toContain(new Coord(5, 3));
            expect(component.possibleLandings).not.toContain(new Coord(4, 2));
            expect(component.possibleLandings).toContain(new Coord(10, 2));
            expect(component.possibleLandings).toContain(new Coord(9, 3));
        }));
        it('Should deselect piece when clicking a second time on it', fakeAsync(async() => {
            // Given a board on which a piece is selected
            await testUtils.expectClickSuccess('#click_6_2');

            // When clicking on it again
            await testUtils.expectClickSuccess('#click_6_2');

            // Then the different highlighs should be gone since the piece is deselected
            const component: CoerceoComponent = testUtils.getComponent();
            testUtils.expectElementNotToExist('#selected_6_2');
            expect(component.possibleLandings.length).toBe(0);
        }));
        it('Should refuse invalid movement', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#click_6_2');
            await testUtils.expectClickFailure('#click_8_4', CoerceoFailure.INVALID_DISTANCE());
        }));
    });
});
