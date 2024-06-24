/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { TriGoComponent } from '../tri-go.component';
import { GoMove } from 'src/app/games/gos/GoMove';
import { GoState } from 'src/app/games/gos/GoState';
import { GoPiece } from '../../GoPiece';
import { Table } from 'src/app/jscaip/TableUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from '@everyboard/lib';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { GoPhase } from '../../GoPhase';

fdescribe('TriGoComponent', () => {

    let testUtils: ComponentTestUtils<TriGoComponent>;

    const _: GoPiece = GoPiece.EMPTY;
    const O: GoPiece = GoPiece.DARK;
    const X: GoPiece = GoPiece.LIGHT;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<TriGoComponent>('Go');
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
        const state: GoState = new GoState(board, PlayerNumberMap.of(0, 0), 1, MGPOptional.empty(), GoPhase.PLAYING);
        await testUtils.setupState(state);

        const move: GoMove = new GoMove(0, 1);
        await testUtils.expectMoveSuccess('#click-0-1', move);
        testUtils.expectElementToHaveClass('#polygon-0-0', 'captured-fill');
    }));

    it('should allow simple clicks', fakeAsync(async() => {
        const move: GoMove = new GoMove(1, 1);
        await testUtils.expectMoveSuccess('#click-1-1', move);
        const secondMove: GoMove = new GoMove(2, 2);
        await testUtils.expectMoveSuccess('#click-2-2', secondMove);
    }));

});
