/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PenteComponent } from '../pente.component';
import { PenteMove } from '../PenteMove';
import { PenteState } from '../PenteState';

describe('PenteComponent', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    let testUtils: ComponentTestUtils<PenteComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<PenteComponent>('Pente');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    it('should do the move when clicking on an empty square', fakeAsync(async() => {
        // Given a state
        // When clicking on an empty state
        // Then a move should be done
        const move: PenteMove = PenteMove.from(new Coord(4, 2)).get();
        await testUtils.expectMoveSuccess('#click_4_2', move);
    }));
    it('should forbid dropping on a piece already on the board', fakeAsync(async() => {
        // Given a state
        // When clicking on square with a piece
        // Then the move should fail
        const move: PenteMove = PenteMove.from(new Coord(9, 9)).get();
        await testUtils.expectMoveFailure('#click_9_9', RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE(), move);
    }));
    it('should show last move', fakeAsync(async() => {
        // Given a state
        // When doing a move
        const move: PenteMove = PenteMove.from(new Coord(4, 2)).get();
        await testUtils.expectMoveSuccess('#click_4_2', move);
        // Then it should show the last move
        testUtils.expectElementToHaveClass('#piece_4_2', 'last-move-stroke');
    }));
    it('should show captures along with last move', fakeAsync(async() => {
        // Given a board where a capture is possible
        const state: PenteState = new PenteState([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, X, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], [0, 0], 3);
        testUtils.setupState(state);

        // When doing the capture
        const move: PenteMove = PenteMove.from(new Coord(9, 6)).get();
        await testUtils.expectMoveSuccess('#click_9_6', move);

        // Then it should show it
        testUtils.expectElementToExist('#capture_9_8');
        testUtils.expectElementToExist('#capture_9_7');
        testUtils.expectElementNotToExist('#capture_9_6');
        testUtils.expectElementToHaveClass('#piece_9_6', 'last-move-stroke');
    }));
    it('should show victory', fakeAsync(async() => {
        // Given a victory
        const state: PenteState = new PenteState([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X, X, X, X, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, X, O, O, O, O, O, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], [0, 0], 6);
        // When displaying it
        testUtils.setupState(state);
        // Then it should show the victory
        testUtils.expectElementToHaveClass('#piece_9_9', 'victory-stroke');
        testUtils.expectElementToHaveClass('#piece_10_9', 'victory-stroke');
        testUtils.expectElementToHaveClass('#piece_11_9', 'victory-stroke');
        testUtils.expectElementToHaveClass('#piece_12_9', 'victory-stroke');
        testUtils.expectElementToHaveClass('#piece_13_9', 'victory-stroke');
    }));
    it('should show hoshis', fakeAsync(async() => {
        // Given a state
        // When displaying it
        // Then it should show the visible hoshis
        testUtils.expectElementToExist('#hoshi_3_9');
        testUtils.expectElementToExist('#hoshi_9_3');
        testUtils.expectElementToExist('#hoshi_9_15');
        testUtils.expectElementToExist('#hoshi_15_9');
        testUtils.expectElementToExist('#hoshi_3_3');
        testUtils.expectElementToExist('#hoshi_3_15');
        testUtils.expectElementToExist('#hoshi_15_3');
        testUtils.expectElementToExist('#hoshi_15_15');
        // But not the occupied ones
        testUtils.expectElementNotToExist('#hoshi_9_9');
    }));
});
