/* eslint-disable max-lines-per-function */
import { KamisadoState } from 'src/app/games/kamisado/KamisadoState';
import { KamisadoColor } from 'src/app/games/kamisado/KamisadoColor';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { KamisadoFailure } from 'src/app/games/kamisado/KamisadoFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { KamisadoComponent } from '../kamisado.component';
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { KamisadoMove } from 'src/app/games/kamisado/KamisadoMove';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';

describe('KamisadoComponent', () => {

    let componentTestUtils: ComponentTestUtils<KamisadoComponent>;

    const _: KamisadoPiece = KamisadoPiece.EMPTY;
    const R: KamisadoPiece = KamisadoPiece.ZERO.RED;
    const G: KamisadoPiece = KamisadoPiece.ZERO.GREEN;
    const r: KamisadoPiece = KamisadoPiece.ONE.RED;
    const b: KamisadoPiece = KamisadoPiece.ONE.BROWN;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<KamisadoComponent>('Kamisado');
    }));
    it('should create', () => {
        componentTestUtils.expectToBeCreated();
    });
    it('should remove chosen coord when calling updateBoard without move', () => {
        // Given the game component
        // When calling updateBoard()
        componentTestUtils.getComponent().updateBoard();
        // Then the chosen piece should be absent, and nothing should be highlighted
        expect(componentTestUtils.getComponent().chosen.isAbsent()).toBeTrue();
        componentTestUtils.expectElementNotToExist('.highlight');
    });
    it('should not allow to pass initially', fakeAsync(async() => {
        // Given the initial state
        // When displaying the board
        // Then the player cannot pass initially
        componentTestUtils.expectPassToBeForbidden();
    }));
    it('should allow changing initial choice', fakeAsync(async() => {
        // Given a component where a piece has been selected
        await componentTestUtils.expectClickSuccess('#click_0_7');
        // When clicking on a different piece from the same player
        await componentTestUtils.expectClickSuccess('#click_1_7');
        // Then it should change the selected piece
        expect(componentTestUtils.getComponent().chosen.equalsValue(new Coord(1, 7))).toBeTrue();
    }));
    it('should allow deselecting initial choice', fakeAsync(async() => {
        // Given a component where a piece has been selected
        await componentTestUtils.expectClickSuccess('#click_0_7'); // Select initial piece
        // When clicking on the same piece
        await componentTestUtils.expectClickSuccess('#click_0_7');
        // Then it should be deselected
        expect(componentTestUtils.getComponent().chosen.isAbsent()).toBeTrue();
        componentTestUtils.expectElementNotToExist('.highlight');
    }));
    it('should allow to pass if stuck position', fakeAsync(async() => {
        // Given a board with a stuck piece being the one that has to move
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

        // When displaying the board
        componentTestUtils.setupState(state);

        // Then the player can pass
        await componentTestUtils.expectPassSuccess(KamisadoMove.PASS);
    }));
    it('should forbid all click in stuck position and ask to pass', fakeAsync(async() => {
        // Given a board where the piece that must move is stuck
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

        // When clicking anywhere
        // Thne it should fail and say that player must pass
        await componentTestUtils.expectClickFailure('#click_1_7', RulesFailure.MUST_PASS());
    }));
    it('should forbid de-selecting a piece that is pre-selected', fakeAsync(async() => {
        // Given a state where the next piece to play is already selected for the player
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

        // When clicking on the piece to deselect it
        // Then it should fail
        await componentTestUtils.expectClickFailure('#click_0_7', KamisadoFailure.PLAY_WITH_SELECTED_PIECE());
    }));
    it('should forbid selecting a piece if one is already pre-selected', fakeAsync(async() => {
        // Given a state where the next piece to play is already selected for the player
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, G, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        componentTestUtils.setupState(state);

        // When clicking on another of its pieces
        // Then it should fail
        await componentTestUtils.expectClickFailure('#click_1_7', KamisadoFailure.PLAY_WITH_SELECTED_PIECE());
    }));
    it('should forbid moving to invalid location', fakeAsync(async() => {
        // Given a board (here, the initial board) with a selected piece
        await componentTestUtils.expectClickSuccess('#click_0_7');
        // When trying to perform an invalid move
        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(5, 4));
        // Then it should fail
        await componentTestUtils.expectMoveFailure('#click_5_4', KamisadoFailure.DIRECTION_NOT_ALLOWED(), move);
    }));
    it('should forbid choosing an incorrect piece', fakeAsync(async() => {
        // Given a board (here, the initial board)
        // When clicking on an opponent's piece
        // Then it should fail
        await componentTestUtils.expectClickFailure('#click_0_0', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    }));
});
