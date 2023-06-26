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

    let testUtils: ComponentTestUtils<KamisadoComponent>;

    const _: KamisadoPiece = KamisadoPiece.EMPTY;
    const R: KamisadoPiece = KamisadoPiece.ZERO.RED;
    const G: KamisadoPiece = KamisadoPiece.ZERO.GREEN;
    const r: KamisadoPiece = KamisadoPiece.ONE.RED;
    const b: KamisadoPiece = KamisadoPiece.ONE.BROWN;
    const B: KamisadoPiece = KamisadoPiece.ZERO.BLUE;

    const o: KamisadoPiece = KamisadoPiece.ONE.ORANGE;
    const p: KamisadoPiece = KamisadoPiece.ONE.PURPLE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<KamisadoComponent>('Kamisado');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    it('should remove chosen coord when calling updateBoard without move', async() => {
        // Given the game component
        // When calling updateBoard()
        await testUtils.getComponent().updateBoard();
        // Then the chosen piece should be absent, and nothing should be highlighted
        expect(testUtils.getComponent().chosen.isAbsent()).toBeTrue();
        testUtils.expectElementNotToExist('.highlight');
    });
    it('should not allow to pass initially', fakeAsync(async() => {
        // Given the initial state
        // When displaying the board
        // Then the player cannot pass initially
        testUtils.expectPassToBeForbidden();
    }));
    it('should allow changing initial choice', fakeAsync(async() => {
        // Given a component where a piece has been selected
        await testUtils.expectClickSuccess('#click_0_7');
        // When clicking on a different piece from the same player
        await testUtils.expectClickSuccess('#click_1_7');
        // Then it should change the selected piece
        expect(testUtils.getComponent().chosen.equalsValue(new Coord(1, 7))).toBeTrue();
    }));
    it('should allow deselecting initial choice', fakeAsync(async() => {
        // Given a component where a piece has been selected
        await testUtils.expectClickSuccess('#click_0_7'); // Select initial piece
        // When clicking on the same piece
        await testUtils.expectClickSuccess('#click_0_7');
        // Then it should be deselected
        expect(testUtils.getComponent().chosen.isAbsent()).toBeTrue();
        testUtils.expectElementNotToExist('.highlight');
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
        await testUtils.setupState(state);

        // Then the player can pass
        await testUtils.expectPassSuccess(KamisadoMove.PASS);
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
        await testUtils.setupState(state);

        // When clicking anywhere
        // Then it should fail and say that player must pass
        await testUtils.expectClickFailure('#click_1_7', RulesFailure.MUST_PASS());
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
        await testUtils.setupState(state);

        // When clicking on the piece to deselect it
        // Then it should fail
        await testUtils.expectClickFailure('#click_0_7', KamisadoFailure.PLAY_WITH_SELECTED_PIECE());
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
        await testUtils.setupState(state);

        // When clicking on another of its pieces
        // Then it should fail
        await testUtils.expectClickFailure('#click_1_7', KamisadoFailure.PLAY_WITH_SELECTED_PIECE());
    }));
    it('should forbid moving to invalid location', fakeAsync(async() => {
        // Given a board (here, the initial board) with a selected piece
        await testUtils.expectClickSuccess('#click_0_7');
        // When trying to perform an invalid move
        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(5, 4));
        // Then it should fail
        await testUtils.expectMoveFailure('#click_5_4', KamisadoFailure.DIRECTION_NOT_ALLOWED(), move);
    }));
    it('should forbid choosing an incorrect piece', fakeAsync(async() => {
        // Given a board (here, the initial board)
        // When clicking on an opponent's piece
        // Then it should fail
        await testUtils.expectClickFailure('#click_0_0', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    }));
    it('should not highlight selected piece if game has ended', fakeAsync(async() => {
        // Given a board where one player has won
        const board: Table<KamisadoPiece> = [
            [_, R, _, _, _, _, _, _],
            [_, _, r, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(1, KamisadoColor.RED, MGPOptional.of(new Coord(2, 1)), false, board);

        // When displaying the board
        await testUtils.setupState(state);

        // Then the next selected piece should not be highlighted
        testUtils.expectElementNotToExist('#selectedPiece');
    }));
    it('should show last move when it is not a PASS', fakeAsync(async() => {
        // Given a board that has a last move
        const board: Table<KamisadoPiece> = [
            [_, o, p, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, B, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(0, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const lastMove: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 6));

        // When displaying it
        await testUtils.setupState(state, undefined, lastMove);

        // Then it should display last move
        testUtils.expectElementToHaveClass('#last_move_start_0_7', 'last-move-stroke');
        testUtils.expectElementToHaveClass('#last_move_start_0_6', 'last-move-stroke');
    }));
});
