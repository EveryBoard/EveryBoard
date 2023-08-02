/* eslint-disable max-lines-per-function */
import { GoComponent } from '../go.component';
import { GoMove } from 'src/app/games/go/GoMove';
import { GoState, GoPiece, Phase } from 'src/app/games/go/GoState';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';

describe('GoComponent', () => {

    let testUtils: ComponentTestUtils<GoComponent>;

    const _: GoPiece = GoPiece.EMPTY;
    const O: GoPiece = GoPiece.DARK;
    const X: GoPiece = GoPiece.LIGHT;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<GoComponent>('Go');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    it('should allow to pass twice, then use "pass" as the method to "accept"', fakeAsync(async() => {
        await testUtils.expectPassSuccess(GoMove.PASS); // Passed
        await testUtils.expectPassSuccess(GoMove.PASS); // Counting
        await testUtils.expectPassSuccess(GoMove.ACCEPT); // Accept
        await testUtils.expectPassSuccess(GoMove.ACCEPT); // Finished
        testUtils.expectPassToBeForbidden();
    }));
    it('should show captures', fakeAsync(async() => {
        const board: Table<GoPiece> = [
            [O, X, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);
        testUtils.setupState(state);

        const move: GoMove = new GoMove(0, 1);
        await testUtils.expectMoveSuccess('#click_0_1', move);
        const goComponent: GoComponent = testUtils.getComponent();
        expect(goComponent.captures).toEqual([new Coord(0, 0)]);
    }));
    it('should allow simple clicks', fakeAsync(async() => {
        const move: GoMove = new GoMove(1, 1);
        await testUtils.expectMoveSuccess('#click_1_1', move);
        const secondMove: GoMove = new GoMove(2, 2);
        await testUtils.expectMoveSuccess('#click_2_2', secondMove);
    }));
    describe('hoshi', () => {
        it('should be in (3, 3) and other centraly symmetrical coords fo 19x19 board', fakeAsync(async() => {
            // Given a 19x19 board
            GoState.HEIGHT = 19;
            GoState.WIDTH = 19;
            const board: Table<GoPiece> = ArrayUtils.createTable(19, 19, GoPiece.EMPTY);
            const state: GoState = new GoState(board, [], 0, MGPOptional.empty(), Phase.PLAYING);

            // When displaying it
            testUtils.setupState(state);

            // Then it should have hoshi in the middle (9, 9)
            testUtils.expectElementToExist('#hoshi_9_9'); // Middle Middle
            // Then it should have hoshi in (3, 3) and (cx, 3) and the 4 central symmetric ones
            testUtils.expectElementToExist('#hoshi_3_3'); // Left Up
            testUtils.expectElementToExist('#hoshi_9_3'); // Middle Up
            testUtils.expectElementToExist('#hoshi_15_3'); // Right Up
            testUtils.expectElementToExist('#hoshi_15_9'); // Right Middle
            testUtils.expectElementToExist('#hoshi_15_15'); // Right Down
            testUtils.expectElementToExist('#hoshi_9_15'); // Middle Down
            testUtils.expectElementToExist('#hoshi_3_15'); // Left Down
            testUtils.expectElementToExist('#hoshi_3_9'); // Left Middle
        }));
        it('should be in (3, 3) and other centraly symmetrical coords for 13x13 board', fakeAsync(async() => {
            // Given a 13x13 board
            GoState.HEIGHT = 13;
            GoState.WIDTH = 13;
            const board: Table<GoPiece> = ArrayUtils.createTable(13, 13, GoPiece.EMPTY);
            const state: GoState = new GoState(board, [], 0, MGPOptional.empty(), Phase.PLAYING);

            // When displaying it
            testUtils.setupState(state);
            // Then it should have hoshi in the middle (6, 6)
            testUtils.expectElementToExist('#hoshi_6_6'); // Middle Middle

            // Then it should have hoshi in (3, 3) and the 4 central symmetric ones
            testUtils.expectElementToExist('#hoshi_3_3'); // Left Up
            testUtils.expectElementToExist('#hoshi_9_3'); // Right Up
            testUtils.expectElementToExist('#hoshi_9_9'); // Right Down
            testUtils.expectElementToExist('#hoshi_3_9'); // Left Down
            // And not the (cx, 3) and the 4 other one
            testUtils.expectElementNotToExist('#hoshi_6_3'); // Middle Up
            testUtils.expectElementNotToExist('#hoshi_9_6'); // Right Middle
            testUtils.expectElementNotToExist('#hoshi_6_9'); // Middle Down
            testUtils.expectElementNotToExist('#hoshi_3_6'); // Left Middle
        }));
        it('should be in (2, 2) and other centraly symmetrical coords for 9x9 board', fakeAsync(async() => {
            // Given a 9x9 board
            GoState.HEIGHT = 9;
            GoState.WIDTH = 9;
            const board: Table<GoPiece> = ArrayUtils.createTable(9, 9, GoPiece.EMPTY);
            const state: GoState = new GoState(board, [], 0, MGPOptional.empty(), Phase.PLAYING);

            // When displaying it
            testUtils.setupState(state);

            // Then it should have hoshi in the middle (4, 4)
            testUtils.expectElementToExist('#blank_board');
            testUtils.expectElementToExist('#hoshi_4_4'); // Middle Middle
            // Then it should have hoshi in (2, 2) and (cx, 2) and the 4 central symmetric ones
            testUtils.expectElementToExist('#hoshi_2_2'); // Left Up
            testUtils.expectElementToExist('#hoshi_6_2'); // Right Up
            testUtils.expectElementToExist('#hoshi_6_6'); // Right Down
            testUtils.expectElementToExist('#hoshi_2_6'); // Left Down
            // And the (3, cx) one should not be there
            testUtils.expectElementNotToExist('#hoshi_4_2'); // Middle Up
            testUtils.expectElementNotToExist('#hoshi_4_6'); // Middle Down
            testUtils.expectElementNotToExist('#hoshi_6_4'); // Right Middle
            testUtils.expectElementNotToExist('#hoshi_2_4'); // Left Middle
        }));
    });
});
