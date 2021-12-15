import { GoComponent } from '../go.component';
import { GoMove } from 'src/app/games/go/GoMove';
import { GoState, GoPiece, Phase } from 'src/app/games/go/GoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync, tick } from '@angular/core/testing';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('GoComponent', () => {

    let componentTestUtils: ComponentTestUtils<GoComponent>;

    const _: GoPiece = GoPiece.EMPTY;
    const O: GoPiece = GoPiece.BLACK;
    const X: GoPiece = GoPiece.WHITE;

    beforeAll(() => {
        GoState.HEIGHT = 5;
        GoState.WIDTH = 5;
    });
    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<GoComponent>('Go');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('Should allow to pass twice, then use "pass" as the method to "accept"', fakeAsync(async() => {
        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue(); // Passed
        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue(); // Counting
        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue(); // Accept

        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue(); // Finished

        expect((await componentTestUtils.getComponent().pass()).reason).toBe(RulesFailure.CANNOT_PASS());
        tick(3000); // needs to be >2999
    }));
    it('Should show captures', fakeAsync(async() => {
        const board: Table<GoPiece> = [
            [O, X, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);
        componentTestUtils.setupState(state);

        const move: GoMove = new GoMove(0, 1);
        await componentTestUtils.expectMoveSuccess('#click_0_1', move, undefined, [0, 0]);
        const goComponent: GoComponent = componentTestUtils.getComponent();
        expect(goComponent.captures).toEqual([new Coord(0, 0)]);
    }));
    it('Should allow simple clicks', fakeAsync(async() => {
        const move: GoMove = new GoMove(1, 1);
        await componentTestUtils.expectMoveSuccess('#click_1_1', move, undefined, [0, 0]);
        const secondMove: GoMove = new GoMove(2, 2);
        await componentTestUtils.expectMoveSuccess('#click_2_2', secondMove, undefined, [0, 0]);
    }));
});
