import { KamisadoPartSlice } from 'src/app/games/kamisado/KamisadoPartSlice';
import { KamisadoColor } from 'src/app/games/kamisado/KamisadoColor';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { KamisadoFailure } from 'src/app/games/kamisado/KamisadoRules';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { KamisadoComponent, KamisadoComponentFailure } from '../kamisado.component';
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { KamisadoMove } from 'src/app/games/kamisado/KamisadoMove';

describe('KamisadoComponent', () => {
    let componentTestUtils: ComponentTestUtils<KamisadoComponent>;

    const _: number = KamisadoPiece.NONE.getValue();
    const R: number = KamisadoPiece.ZERO.RED.getValue();
    const G: number = KamisadoPiece.ZERO.GREEN.getValue();
    const r: number = KamisadoPiece.ONE.RED.getValue();
    const b: number = KamisadoPiece.ONE.BROWN.getValue();

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<KamisadoComponent>('Kamisado');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('should choose (-1,-1) as chosen coord when calling updateBoard without move', () => {
        componentTestUtils.getComponent().updateBoard();
        expect(componentTestUtils.getComponent().chosen.equals(new Coord(-1, -1))).toBeTrue();
    });
    it('should not allow to pass initially', fakeAsync(async() => {
        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeFalse();
    }));
    it('should allow changing initial choice', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_7'); // Select initial piece
        await componentTestUtils.expectClickSuccess('#click_1_7'); // Select another piece
        expect(componentTestUtils.getComponent().chosen.equals(new Coord(1, 7))).toBeTrue();
    }));
    it('should allow deselecting initial choice', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_7'); // Select initial piece
        await componentTestUtils.expectClickSuccess('#click_0_7'); // Deselect it
        expect(componentTestUtils.getComponent().chosen.equals(new Coord(-1, -1))).toBeTrue();
    }));
    it('should allow to pass if stuck position', fakeAsync(async() => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, r, _, _, _, _, _, _],
            [R, G, _, _, _, _, _, _], // red is stuck
        ];
        const slice: KamisadoPartSlice =
            new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        componentTestUtils.setupSlice(slice);

        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue();
    }));
    it('should forbid de-selecting a piece that is pre-selected', fakeAsync(async() => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _], // brown is stuck
            [R, _, _, _, _, _, _, _],
        ];
        const slice: KamisadoPartSlice =
            new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickFailure('#click_0_7', KamisadoComponentFailure.PLAY_WITH_SELECTED_PIECE);
    }));
    it('should forbid selecting a piece if one is already pre-selected', fakeAsync(async() => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _], // brown is stuck
            [R, G, _, _, _, _, _, _],
        ];
        const slice: KamisadoPartSlice =
            new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickFailure('#click_1_7', KamisadoComponentFailure.PLAY_WITH_SELECTED_PIECE);
    }));
    it('should forbid moving to invalid location', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_7');
        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(5, 4));
        await componentTestUtils.expectMoveFailure('#click_5_4', KamisadoFailure.DIRECTION_NOT_ALLOWED, move);
    }));
    it('should forbid choosing an incorrect piece', fakeAsync(async() => {
        await componentTestUtils.expectClickFailure('#click_0_0', KamisadoFailure.NOT_PIECE_OF_PLAYER);
    }));
    it('should forbid choosing a piece at end of the game', fakeAsync(async() => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _], // brown is stuck
            [R, r, _, _, _, _, _, _],
        ];
        const slice: KamisadoPartSlice =
            new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        componentTestUtils.setupSlice(slice);

        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 0));
        await componentTestUtils.expectMoveFailure('#click_0_0', KamisadoFailure.GAME_ENDED, move);
        // can't select a piece either
        expect((componentTestUtils.getComponent().choosePiece(2, 0)).isSuccess()).toBeFalse();
    }));
    it('should delegate decoding to move', () => {
        spyOn(KamisadoMove, 'decode').and.callThrough();
        componentTestUtils.getComponent().decodeMove(5);
        expect(KamisadoMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(KamisadoMove, 'encode').and.callThrough();
        componentTestUtils.getComponent().encodeMove(KamisadoMove.of(new Coord(0, 7), new Coord(0, 6)));
        expect(KamisadoMove.encode).toHaveBeenCalledTimes(1);
    });
});
