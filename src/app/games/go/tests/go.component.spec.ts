/* eslint-disable max-lines-per-function */
import { GoComponent } from '../go.component';
import { GoMove } from 'src/app/games/go/GoMove';
import { GoState, GoPiece, Phase } from 'src/app/games/go/GoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';

describe('GoComponent', () => {

    let componentTestUtils: ComponentTestUtils<GoComponent>;

    const _: GoPiece = GoPiece.EMPTY;
    const O: GoPiece = GoPiece.DARK;
    const X: GoPiece = GoPiece.LIGHT;

    beforeAll(() => {
        GoState.HEIGHT = 5;
        GoState.WIDTH = 5;
    });
    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<GoComponent>('Go');
    }));
    it('should create', () => {
        componentTestUtils.expectToBeCreated();
    });
    it('Should allow to pass twice, then use "pass" as the method to "accept"', fakeAsync(async() => {
        await componentTestUtils.expectPassSuccess(GoMove.PASS, [0, 0]); // Passed
        await componentTestUtils.expectPassSuccess(GoMove.PASS, [0, 0]); // Counting
        await componentTestUtils.expectPassSuccess(GoMove.ACCEPT, [0, 0]); // Accept
        await componentTestUtils.expectPassSuccess(GoMove.ACCEPT, [0, 0]); // Finished
        componentTestUtils.expectPassToBeForbidden();
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
