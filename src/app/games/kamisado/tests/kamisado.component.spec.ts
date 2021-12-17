import { KamisadoState } from 'src/app/games/kamisado/KamisadoState';
import { KamisadoColor } from 'src/app/games/kamisado/KamisadoColor';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { KamisadoFailure } from 'src/app/games/kamisado/KamisadoFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { KamisadoComponent } from '../kamisado.component';
import { fakeAsync, tick } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { KamisadoMove } from 'src/app/games/kamisado/KamisadoMove';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';

describe('KamisadoComponent', () => {

    let componentTestUtils: ComponentTestUtils<KamisadoComponent>;

    const _: KamisadoPiece = KamisadoPiece.NONE;
    const R: KamisadoPiece = KamisadoPiece.ZERO.RED;
    const G: KamisadoPiece = KamisadoPiece.ZERO.GREEN;
    const r: KamisadoPiece = KamisadoPiece.ONE.RED;
    const b: KamisadoPiece = KamisadoPiece.ONE.BROWN;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<KamisadoComponent>('Kamisado');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('should choose (-2, -2) as chosen coord when calling updateBoard without move', () => {
        componentTestUtils.getComponent().updateBoard();
        expect(componentTestUtils.getComponent().chosen.isAbsent()).toBeTrue();
    });
    it('should not allow to pass initially', fakeAsync(async() => {
        expect((await componentTestUtils.getComponent().pass()).reason).toBe(RulesFailure.CANNOT_PASS());
        tick(3000); // needs to be > 2999
    }));
    it('should allow changing initial choice', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_7'); // Select initial piece
        await componentTestUtils.expectClickSuccess('#click_1_7'); // Select another piece
        expect(componentTestUtils.getComponent().chosen.equalsValue(new Coord(1, 7))).toBeTrue();
    }));
    it('should allow deselecting initial choice', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_7'); // Select initial piece
        await componentTestUtils.expectClickSuccess('#click_0_7'); // Deselect it
        expect(componentTestUtils.getComponent().chosen.isAbsent()).toBeTrue();
    }));
    it('should allow to pass if stuck position', fakeAsync(async() => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, r, _, _, _, _, _, _],
            [R, G, _, _, _, _, _, _], // red is stuck
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        componentTestUtils.setupState(state);

        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue();
    }));
    it('should forbid all click in stuck position and ask to pass', fakeAsync(async() => {
        // given a board where the piece that must move is stuck
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, r, _, _, _, _, _, _],
            [R, G, _, _, _, _, _, _], // red is stuck
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        componentTestUtils.setupState(state);

        // when clicking any piece, it should say that player must pass
        await componentTestUtils.expectClickFailure('#click_1_7', RulesFailure.MUST_PASS());
    }));
    it('should forbid de-selecting a piece that is pre-selected', fakeAsync(async() => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _], // brown is stuck
            [R, _, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickFailure('#click_0_7', KamisadoFailure.PLAY_WITH_SELECTED_PIECE());
    }));
    it('should forbid selecting a piece if one is already pre-selected', fakeAsync(async() => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _], // brown is stuck
            [R, G, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickFailure('#click_1_7', KamisadoFailure.PLAY_WITH_SELECTED_PIECE());
    }));
    it('should forbid moving to invalid location', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_7');
        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(5, 4));
        await componentTestUtils.expectMoveFailure('#click_5_4', KamisadoFailure.DIRECTION_NOT_ALLOWED(), move);
    }));
    it('should forbid choosing an incorrect piece', fakeAsync(async() => {
        await componentTestUtils.expectClickFailure('#click_0_0', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    }));
    it('should forbid choosing a piece at end of the game', fakeAsync(async() => {
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, r, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        componentTestUtils.setupState(state);

        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 0));
        // TODO: investigate canUserPlay etc.
        await componentTestUtils.expectMoveFailure('#click_0_0', 'You should never see this message', move);
    }));
});
