/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { MGPOptional } from '@everyboard/lib';

import { PlayerNumberMap } from '../../../../jscaip/PlayerMap';
import { Table } from '../../../../jscaip/TableUtils';
import { ComponentTestUtils } from '../../../../utils/tests/TestUtils.spec';
import { GoMove } from '../../GoMove';
import { GoPhase } from '../../GoPhase';
import { GoPiece } from '../../GoPiece';
import { GoState } from '../../GoState';
import { HexagonalGoComponent } from '../hexagonal-go.component';

describe('HexagonalGoComponent', () => {

    let testUtils: ComponentTestUtils<HexagonalGoComponent>;

    const X: GoPiece = GoPiece.LIGHT;
    const O: GoPiece = GoPiece.DARK;
    const u: GoPiece = GoPiece.DEAD_DARK;
    const w: GoPiece = GoPiece.LIGHT_TERRITORY;
    const _: GoPiece = GoPiece.EMPTY;
    const N: GoPiece = GoPiece.UNREACHABLE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<HexagonalGoComponent>('HexagonalGo');
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

    it('should show captures on the edge', fakeAsync(async() => {
        // Given a board with a possible capture
        const board: Table<GoPiece> = [
            [N, N, N, N, N, N, _, _, _, _, _, _, _],
            [N, N, N, N, N, _, _, _, _, _, _, _, _],
            [N, N, N, N, _, _, _, _, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, _, _, X, _, N, N],
            [_, _, _, _, _, _, _, _, X, O, N, N, N],
            [_, _, _, _, _, _, _, _, X, N, N, N, N],
            [_, _, _, _, _, _, _, _, N, N, N, N, N],
            [_, _, _, _, _, _, _, N, N, N, N, N, N],
        ];
        const state: GoState = new GoState(board, PlayerNumberMap.of(0, 0), 1, MGPOptional.empty(), GoPhase.PLAYING);
        await testUtils.setupState(state, { config: MGPOptional.of({ size: 5 }) });

        const move: GoMove = new GoMove(10, 8);
        await testUtils.expectMoveSuccess('#click-10-8', move);
        testUtils.expectElementToHaveClass('#polygon-9-9', 'captured-fill');
    }));

    it('should show captures on the corner', fakeAsync(async() => {
        // Given a board with a possible capture
        const board: Table<GoPiece> = [
            [N, N, N, N, N, N, _, _, _, _, _, _, _],
            [N, N, N, N, N, _, _, _, _, _, _, _, _],
            [N, N, N, N, _, _, _, _, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, _, _, _, _, N, N],
            [_, _, _, _, _, _, _, _, _, _, N, N, N],
            [_, _, _, _, _, _, _, _, _, N, N, N, N],
            [O, O, _, _, _, _, _, _, N, N, N, N, N],
            [X, _, _, _, _, _, _, N, N, N, N, N, N],
        ];
        const state: GoState = new GoState(board, PlayerNumberMap.of(0, 0), 2, MGPOptional.empty(), GoPhase.PLAYING);
        await testUtils.setupState(state, { config: MGPOptional.of({ size: 5 }) });

        const move: GoMove = new GoMove(1, 12);
        await testUtils.expectMoveSuccess('#click-1-12', move);
        testUtils.expectElementToHaveClass('#polygon-0-12', 'captured-fill');
    }));

    it('should show captures on the center', fakeAsync(async() => {
        // Given a board with a possible capture
        const board: Table<GoPiece> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, X, X, _, _, _],
            [_, _, _, X, O, X, _, _, _],
            [_, _, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: GoState = new GoState(board, PlayerNumberMap.of(0, 0), 1, MGPOptional.empty(), GoPhase.PLAYING);
        await testUtils.setupState(state, { config: MGPOptional.of({ size: 5 }) });

        const move: GoMove = new GoMove(3, 5);
        await testUtils.expectMoveSuccess('#click-3-5', move);
        testUtils.expectElementToHaveClass('#polygon-4-4', 'captured-fill');
    }));

    it('should allow simple clicks', fakeAsync(async() => {
        const move: GoMove = new GoMove(4, 4);
        await testUtils.expectMoveSuccess('#click-4-4', move);
        const secondMove: GoMove = new GoMove(3, 3);
        await testUtils.expectMoveSuccess('#click-3-3', secondMove);
    }));

    it('should show territory and dead', fakeAsync(async() => {
        // Given a board in counting phase with dead and territory
        const board: Table<GoPiece> = [
            [N, N, N, N, N, N, w, w, w, w, w, w, w],
            [N, N, N, N, N, w, w, w, w, w, w, w, w],
            [N, N, N, N, w, w, w, w, w, w, w, w, w],
            [N, N, N, w, w, w, w, w, w, w, w, w, w],
            [N, N, w, w, w, w, w, w, w, w, w, w, w],
            [N, w, w, w, w, w, w, w, w, w, w, w, w],
            [w, w, w, w, w, w, w, w, w, w, w, w, w],
            [w, w, w, w, w, w, w, w, w, w, w, w, N],
            [w, w, w, w, w, w, w, w, w, w, w, N, N],
            [w, w, w, w, w, w, w, w, w, w, N, N, N],
            [X, X, X, w, w, w, w, w, w, N, N, N, N],
            [u, u, X, w, w, w, w, w, N, N, N, N, N],
            [w, u, X, w, w, w, w, N, N, N, N, N, N],
        ];
        const state: GoState =
            new GoState(board, PlayerNumberMap.of(2, 4), 3, MGPOptional.empty(), GoPhase.COUNTING);

        // When rendering it
        await testUtils.setupState(state, { config: MGPOptional.of({ size: 5 }) });

        // Then it should render the dead
        testUtils.expectElementToExist('#dead-0-11');
        testUtils.expectElementToExist('#territory-3-3');
    }));

});
