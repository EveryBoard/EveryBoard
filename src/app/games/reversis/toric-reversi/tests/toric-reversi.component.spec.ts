/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { SimpleGameStateWithTable } from 'src/app/jscaip/state/SimpleGameStateWithTable';

import { FourStatePiece } from '../../../../jscaip/FourStatePiece';
import { Ordinal } from '../../../../jscaip/Ordinal';
import { Table } from '../../../../jscaip/TableUtils';
import { TorusShape } from '../../../../jscaip/shape/TorusShape';
import { OrdinalSquareTopology } from '../../../../jscaip/topology/OrdinalSquareTopology';
import { ComponentTestUtils } from '../../../../utils/tests/TestUtils.spec';
import { ReversiMove } from '../../common/ReversiMove';
import { ReversiState } from '../../common/ReversiState';
import { ToricReversiComponent } from '../toric-reversi.component';


fdescribe('ToricReversiComponent', () => {

    let testUtils: ComponentTestUtils<ToricReversiComponent>;

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const ordinalTopology: OrdinalSquareTopology = new OrdinalSquareTopology();
    const torusShape: TorusShape<Ordinal> = new TorusShape(8, 8, ordinalTopology);
    // TODO: toric shape, not torus shape
    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<ToricReversiComponent>('ToricReversi');
    }));

    it('should hightlight toric captures', fakeAsync(async() => {
        // Given a board where a toric capture could happend
        const board: Table<FourStatePiece> = [
            [_, _, _, X, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, X, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _],
            [X, O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _],
            [_, X, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _],
        ];
        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 0);
        const state: ReversiState = new ReversiState(ordinalTopology, torusShape, gameState);
        await testUtils.setupState(state);

        // When doing that capturing move
        const move: ReversiMove = new ReversiMove(7, 4);

        // Then it should work and the captured coord be highlighted
        await testUtils.expectMoveSuccess('#click-7-4', move);
        testUtils.expectElementNotToHaveClass('#click-0-3', 'captured-fill');
        testUtils.expectElementNotToHaveClass('#click-1-2', 'captured-fill');
        testUtils.expectElementNotToHaveClass('#click-2-1', 'captured-fill');
        testUtils.expectElementNotToHaveClass('#click-3-0', 'captured-fill');
        testUtils.expectElementToHaveClass('#click-0-4', 'captured-fill');
        testUtils.expectElementToHaveClass('#click-0-5', 'captured-fill');
        testUtils.expectElementToHaveClass('#click-1-6', 'captured-fill');
        testUtils.expectElementToHaveClass('#click-7-4', 'moved-fill');
    }));

});
