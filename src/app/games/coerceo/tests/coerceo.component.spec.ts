import { CoerceoComponent } from '../coerceo.component';
import { CoerceoMove } from 'src/app/games/coerceo/CoerceoMove';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { CoerceoFailure } from 'src/app/games/coerceo/CoerceoFailure';
import { CoerceoPartSlice, CoerceoPiece } from 'src/app/games/coerceo/CoerceoPartSlice';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';

describe('CoerceoComponent:', () => {
    let componentTestUtils: ComponentTestUtils<CoerceoComponent>;

    const _: number = CoerceoPiece.EMPTY.value;
    const N: number = CoerceoPiece.NONE.value;
    const O: number = CoerceoPiece.ZERO.value;
    const X: number = CoerceoPiece.ONE.value;

    function getScore(player: number): number {
        return componentTestUtils.getComponent().rules.node.gamePartSlice['captures'][player];
    }
    function expectCoordToBeOfRemovedFill(x: number, y: number): void {
        const gameComponent: CoerceoComponent = componentTestUtils.getComponent();
        const caseContent: number = gameComponent.rules.node.gamePartSlice.getBoardByXY(x, y);
        expect(gameComponent.isEmptyCase(x, y, caseContent)).toBeTrue();
        expect(gameComponent.getEmptyClass(x, y, caseContent)).toBe('captured2');
    }
    function expectCoordToBeOfCapturedFill(x: number, y: number): void {
        const gameComponent: CoerceoComponent = componentTestUtils.getComponent();
        const caseContent: number = gameComponent.rules.node.gamePartSlice.getBoardByXY(x, y);
        expect(gameComponent.isPyramid(x, y, caseContent)).toBeTrue();
        expect(gameComponent.getPyramidClass(caseContent)).toBe('captured');
    }
    beforeEach(fakeAsync(() => {
        componentTestUtils = new ComponentTestUtils<CoerceoComponent>('Coerceo');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('CoerceoComponent should be created');
    });
    it('Should accept tiles exchange proposal as first click', fakeAsync(async() => {
        const move: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(6, 9));
        const reason: string = CoerceoFailure.NOT_ENOUGH_TILES_TO_EXCHANGE;
        await componentTestUtils.expectMoveFailure('#click_6_9', reason,
                                                   move, undefined, getScore(0), getScore(1));
    }));
    it('Should show possibles destination after choosing your own piece', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_6_2');
        const component: CoerceoComponent = componentTestUtils.getComponent();
        expect(component.highlights).toContain(new Coord(7, 1));
        expect(component.highlights).toContain(new Coord(7, 3));
        expect(component.highlights).toContain(new Coord(5, 3));
        expect(component.highlights).toContain(new Coord(4, 2));
    }));
    it('Should accept deplacement', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_6_2');
        const move: CoerceoMove = CoerceoMove.fromCoordToCoord(new Coord(6, 2), new Coord(7, 3));
        await componentTestUtils.expectMoveSuccess('#click_7_3', move, undefined, getScore(0), getScore(1));
    }));
    it('Should cancelMoveAttempt without toasting when re-clicking on selected piece', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_6_2');
        await componentTestUtils.expectClickSuccess('#click_6_2');
        expect(componentTestUtils.getComponent().highlights).toEqual([]);
    }));
    it('Should cancelMove when first click is on empty case', fakeAsync(async() => {
        await componentTestUtils.expectClickFailure('#click_5_5', CoerceoFailure.FIRST_CLICK_SHOULD_NOT_BE_NULL);
    }));
    it('Should refuse invalid deplacement', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_6_2');
        const reason: string = CoerceoFailure.INVALID_DISTANCE;
        await componentTestUtils.expectClickFailure('#click_8_4', reason);
    }));
    it('Should show tile when more than zero', fakeAsync(async() => {
        const board: NumberTable = CoerceoPartSlice.getInitialSlice().getCopiedBoard();
        const state: CoerceoPartSlice = new CoerceoPartSlice(board, 0, [1, 0], [0, 0]);
        componentTestUtils.expectElementNotToExist('#playerZeroTilesCount');
        componentTestUtils.setupSlice(state);
        componentTestUtils.expectElementToExist('#playerZeroTilesCount');
    }));
    it('Should show removed tiles, and captured piece (after tiles exchange)', fakeAsync(async() => {
        // given a board with just removed pieces
        const previousBoard: NumberTable = [
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
        const board: NumberTable = [
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
        const previousState: CoerceoPartSlice = new CoerceoPartSlice(previousBoard, 2, [2, 0], [0, 0]);
        const state: CoerceoPartSlice = new CoerceoPartSlice(board, 3, [0, 0], [1, 0]);
        const previousMove: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(8, 6));

        // when drawing board
        componentTestUtils.setupSlice(state, previousState, previousMove);

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
    it('Should show removed tiles, and captured piece (after deplacement)', fakeAsync(async() => {
        // given a board with just removed pieces
        const previousBoard: NumberTable = [
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
        const board: NumberTable = [
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
        const previousState: CoerceoPartSlice = new CoerceoPartSlice(previousBoard, 2, [0, 0], [0, 0]);
        const previousMove: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(8, 6));
        const state: CoerceoPartSlice = new CoerceoPartSlice(board, 3, [0, 0], [1, 0]);

        // when drawing board
        componentTestUtils.setupSlice(state, previousState, previousMove);

        // then we should see removed tiles
        expectCoordToBeOfCapturedFill(8, 6);
        expectCoordToBeOfRemovedFill(10, 7);
    }));
    describe('encode/decode', () => {
        it('should delegate decoding to move', () => {
            spyOn(CoerceoMove, 'decode').and.callThrough();
            componentTestUtils.getComponent().decodeMove(5);
            expect(CoerceoMove.decode).toHaveBeenCalledTimes(1);
        });
        it('should delegate encoding to move', () => {
            spyOn(CoerceoMove, 'encode').and.callThrough();
            componentTestUtils.getComponent().encodeMove(CoerceoMove.fromTilesExchange(new Coord(1, 1)));
            expect(CoerceoMove.encode).toHaveBeenCalledTimes(1);
        });
    });
});
