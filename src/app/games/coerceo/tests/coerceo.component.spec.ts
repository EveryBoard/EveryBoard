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

    let componentTestUtils: ComponentTestUtils<CoerceoComponent>;

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.NONE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;

    function getScores(): readonly [number, number] {
        return componentTestUtils.getComponent().scores.get();
    }
    function expectCoordToBeOfRemovedFill(x: number, y: number): void {
        const gameComponent: CoerceoComponent = componentTestUtils.getComponent();
        expect(gameComponent.isEmptyCase(x, y)).toBeTrue();
        expect(gameComponent.getEmptyClass(x, y)).toBe('captured2');
    }
    function expectCoordToBeOfCapturedFill(x: number, y: number): void {
        const gameComponent: CoerceoComponent = componentTestUtils.getComponent();
        expect(gameComponent.isPyramid(x, y)).toBeTrue();
        expect(gameComponent.getPyramidClass(x, y)).toBe('captured');
    }
    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<CoerceoComponent>('Coerceo');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('CoerceoComponent should be created').toBeTruthy();
    });
    it('Should accept tiles exchange proposal as first click', fakeAsync(async() => {
        const move: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(6, 9));
        await componentTestUtils.expectMoveFailure('#click_6_9', CoerceoFailure.NOT_ENOUGH_TILES_TO_EXCHANGE(),
                                                   move, undefined, getScores());
    }));
    it('Should show possibles destination after choosing your own piece', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_6_2');
        const component: CoerceoComponent = componentTestUtils.getComponent();
        expect(component.highlights).toContain(new Coord(7, 1));
        expect(component.highlights).toContain(new Coord(7, 3));
        expect(component.highlights).toContain(new Coord(5, 3));
        expect(component.highlights).toContain(new Coord(4, 2));
    }));
    it('Should accept movement', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_6_2');
        const move: CoerceoMove = CoerceoMove.fromCoordToCoord(new Coord(6, 2), new Coord(7, 3));
        await componentTestUtils.expectMoveSuccess('#click_7_3', move, undefined, getScores());
    }));
    it('Should cancelMoveAttempt without toasting when re-clicking on selected piece', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_6_2');
        await componentTestUtils.expectClickSuccess('#click_6_2');
        expect(componentTestUtils.getComponent().highlights).toEqual([]);
    }));
    it('Should cancelMove when first click is on empty space', fakeAsync(async() => {
        await componentTestUtils.expectClickFailure('#click_5_5', CoerceoFailure.FIRST_CLICK_SHOULD_NOT_BE_NULL());
    }));
    it('Should refuse invalid movement', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_6_2');
        await componentTestUtils.expectClickFailure('#click_8_4', CoerceoFailure.INVALID_DISTANCE());
    }));
    it('Should show tile when more than zero', fakeAsync(async() => {
        const board: Table<FourStatePiece> = CoerceoState.getInitialState().getCopiedBoard();
        const state: CoerceoState = new CoerceoState(board, 0, [1, 0], [0, 0]);
        componentTestUtils.expectElementNotToExist('#playerZeroTilesCount');
        componentTestUtils.setupState(state);
        componentTestUtils.expectElementToExist('#playerZeroTilesCount');
    }));
    it('Should show removed tiles, and captured piece (after tiles exchange)', fakeAsync(async() => {
        // given a board with just removed pieces
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

        // when drawing board
        componentTestUtils.setupState(state, previousState, previousMove);

        // then we should see removed tiles
        expectCoordToBeOfCapturedFill(8, 6);
        expectCoordToBeOfRemovedFill(7, 6);
        expectCoordToBeOfRemovedFill(6, 6);
        expectCoordToBeOfRemovedFill(8, 7);
        expectCoordToBeOfRemovedFill(7, 7);
        expectCoordToBeOfRemovedFill(6, 7);
        componentTestUtils.expectElementToExist('#tilesCountZero');
        componentTestUtils.expectElementNotToExist('#tilesCountOne');
    }));
    it('Should show removed tiles, and captured piece (after movement)', fakeAsync(async() => {
        // given a board with just removed pieces
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

        // when drawing board
        componentTestUtils.setupState(state, previousState, previousMove);

        // then we should see removed tiles
        expectCoordToBeOfCapturedFill(8, 6);
        expectCoordToBeOfRemovedFill(10, 7);
    }));
});
