import { DvonnComponent } from './dvonn.component';

import { Coord } from 'src/app/jscaip/coord/Coord';
import { DvonnMove } from 'src/app/games/dvonn/dvonn-move/DvonnMove';
import { DvonnPieceStack } from 'src/app/games/dvonn/dvonn-piece-stack/DvonnPieceStack';
import { DvonnPartSlice } from 'src/app/games/dvonn/DvonnPartSlice';
import { Player } from 'src/app/jscaip/player/Player';
import { DvonnBoard } from 'src/app/games/dvonn/DvonnBoard';
import { JSONValue } from 'src/app/utils/utils/utils';
import { fakeAsync } from '@angular/core/testing';
import { DvonnFailure } from 'src/app/games/dvonn/dvonn-rules/DvonnRules';
import { ComponentTestUtils } from 'src/app/utils/TestUtils';


describe('DvonnComponent', () => {
    let componentTestUtils: ComponentTestUtils<DvonnComponent>;

    const _: DvonnPieceStack = DvonnPieceStack.EMPTY;
    const D: DvonnPieceStack = DvonnPieceStack.SOURCE;
    const W: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
    const WW: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 2, false);

    beforeEach(fakeAsync(() => {
        componentTestUtils = new ComponentTestUtils<DvonnComponent>('Dvonn');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('DvonnComponent should be created');
    });
    it('should not allow to pass initially', fakeAsync(async() => {
        expect((await componentTestUtils.getComponent().pass()).isFailure()).toBeTrue();
    }));
    it('should allow valid moves', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_2_0');
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(2, 1));
        await componentTestUtils.expectMoveSuccess('#click_2_1', move);
    }));
    it('should allow to pass if stuck position', async() => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _, D, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);
        const slice: DvonnPartSlice = new DvonnPartSlice(board, 0, false);
        componentTestUtils.setupSlice(slice);
        expect(componentTestUtils.getComponent().canPass).toBeTrue();
        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue();
    });
    it('should disallow moving from an invalid location', async() => {
        const gameComponent: DvonnComponent = componentTestUtils.getComponent();
        expect((await gameComponent.onClick(0, 0)).isSuccess()).toBeFalse();
    });
    it('should disallow moving to invalid location', async() => {
        const gameComponent: DvonnComponent = componentTestUtils.getComponent();
        expect((await gameComponent.onClick(2, 0)).isSuccess()).toBeTrue();
        expect((await gameComponent.onClick(1, 0)).isSuccess()).toBeFalse();
    });
    it('should disallow choosing an incorrect piece', async() => {
        // select black piece (but white plays first)
        await componentTestUtils.expectClickFailure('#click_1_1', DvonnFailure.NOT_PLAYER_PIECE);
    });
    xit('should disallow choosing a piece at end of the game', async() => {
        const board: DvonnBoard = new DvonnBoard([
            [_, _, W, _, _, _, _, _, _, _, _],
            [_, _, D, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);
        componentTestUtils.setupSlice(new DvonnPartSlice(board, 0, true));
        await componentTestUtils.expectClickForbidden('#click_2_0');
    });
    it('should show disconnection/captures precisely', fakeAsync(async() => {
        // given board with ready disconnection
        const board: DvonnBoard = new DvonnBoard([
            [_, _, WW, _, _, _, _, _, _, _, _],
            [_, _, D, W, W, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);
        componentTestUtils.setupSlice(new DvonnPartSlice(board, 0, false));

        // When doing that disconnection
        await componentTestUtils.expectClickSuccess('#click_3_1');
        const move: DvonnMove = DvonnMove.of(new Coord(3, 1), new Coord(2, 1));
        await componentTestUtils.expectMoveSuccess('#click_2_1', move);

        const gameComponent: DvonnComponent = componentTestUtils.getComponent();
        // expect board to show it
        expect(gameComponent.disconnecteds).toEqual([
            { x: 4, y: 1, caseContent: W },
        ]);
    }));
    it('should delegate decoding to move', () => {
        spyOn(DvonnMove, 'decode').and.callThrough();
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(2, 1));
        const encoded: JSONValue = componentTestUtils.getComponent().encodeMove(move);
        componentTestUtils.getComponent().decodeMove(encoded);
        expect(DvonnMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(DvonnMove, 'encode').and.callThrough();
        componentTestUtils.getComponent().encodeMove(DvonnMove.of(new Coord(2, 0), new Coord(2, 1)));
        expect(DvonnMove.encode).toHaveBeenCalledTimes(1);
    });
});

