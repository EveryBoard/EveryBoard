/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { SaharaComponent } from '../sahara.component';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaMove } from 'src/app/games/sahara/SaharaMove';
import { SaharaState } from 'src/app/games/sahara/SaharaState';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { SaharaFailure } from '../SaharaFailure';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Table } from 'src/app/utils/ArrayUtils';

describe('SaharaComponent', () => {

    let componentTestUtils: ComponentTestUtils<SaharaComponent>;
    const N: FourStatePiece = FourStatePiece.NONE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const _: FourStatePiece = FourStatePiece.EMPTY;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<SaharaComponent>('Sahara');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('Should play correctly shortest victory', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, _, X, _, _, _, O, X, N, N],
            [N, _, O, _, _, _, _, _, _, _, N],
            [X, _, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, X, _, _, N],
            [N, N, X, O, _, _, _, _, O, N, N],
        ];
        const initialState: SaharaState = new SaharaState(board, 2);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_2_1'); // select first piece
        const move: SaharaMove = SaharaMove.from(new Coord(2, 1), new Coord(1, 2)).get();
        await componentTestUtils.expectMoveSuccess('#click_1_2', move); // select landing

        expect(componentTestUtils.wrapper.endGame).toBeTrue();
    }));
    it('should not allow to click on empty space when no pyramid selected', fakeAsync(async() => {
        // Given the initial board
        // when clicking on empty space, expect move to be refused
        await componentTestUtils.expectClickFailure('#click_2_2', SaharaFailure.MUST_CHOOSE_PYRAMID_FIRST());
    }));
    it('should not allow to select opponent pyramid', fakeAsync(async() => {
        // Given the initial board
        // when clicking on opponent's pyramid, expect move to be refused
        await componentTestUtils.expectClickFailure('#click_0_4', SaharaFailure.MUST_CHOOSE_OWN_PYRAMID());
    }));
    it('should not allow to land on opponent pyramid', fakeAsync(async() => {
        // Given the initial board
        await componentTestUtils.expectClickSuccess('#click_2_0');
        const move: SaharaMove = SaharaMove.from(new Coord(2, 0), new Coord(3, 0)).get();
        await componentTestUtils.expectMoveFailure('#click_3_0', RulesFailure.MUST_LAND_ON_EMPTY_SPACE(), move);
    }));
    it('should not allow to bounce on occupied dark space', fakeAsync(async() => {
        // Given the initial board
        await componentTestUtils.expectClickSuccess('#click_7_0');
        const move: SaharaMove = SaharaMove.from(new Coord(7, 0), new Coord(8, 1)).get();
        await componentTestUtils.expectMoveFailure('#click_8_1', SaharaFailure.CAN_ONLY_REBOUND_ON_EMPTY_SPACE(), move);
    }));
    it('should not allow invalid moves', fakeAsync(async() => {
        // Given the initial board
        await componentTestUtils.expectClickSuccess('#click_0_3');
        const reason: string = 'You can move one or two spaces, not 3.';
        await componentTestUtils.expectClickFailure('#click_2_2', reason);
    }));
    it('should change selected piece when clicking twice in a row on current player pieces', fakeAsync(async() => {
        // Given the initial board
        await componentTestUtils.expectClickSuccess('#click_2_0');
        await componentTestUtils.expectClickSuccess('#click_7_0');
    }));
    it('should take "false neighbor" as 3-step move', fakeAsync(async() => {
        // given the initial board with a first piece selected
        await componentTestUtils.expectClickSuccess('#click_7_0');

        // when clicking on the false neighbor
        // then the correct message should be shown
        const reason: string = SaharaFailure.THOSE_TWO_SPACES_ARE_NOT_NEIGHBORS();
        await componentTestUtils.expectClickFailure('#click_7_1', reason);
    }));
});
