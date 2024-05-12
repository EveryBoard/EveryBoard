/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PenteComponent } from '../pente.component';
import { PenteMove } from '../PenteMove';
import { PenteState } from '../PenteState';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

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
        const move: PenteMove = PenteMove.of(new Coord(4, 2));
        await testUtils.expectMoveSuccess('#click-4-2', move);
    }));

    it('should forbid dropping on a piece already on the board', fakeAsync(async() => {
        // Given a state
        // When clicking on square with a piece
        // Then it should fail
        const move: PenteMove = PenteMove.of(new Coord(9, 9));
        await testUtils.expectMoveFailure('#click-9-9', RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE(), move);
    }));

    it('should show last move', fakeAsync(async() => {
        // Given a state
        // When doing a move
        const move: PenteMove = PenteMove.of(new Coord(4, 2));
        await testUtils.expectMoveSuccess('#click-4-2', move);
        // Then it should show the last move
        testUtils.expectElementToHaveClass('#piece-4-2', 'last-move-stroke');
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
        ], PlayerNumberMap.of(0, 0), 3);
        await testUtils.setupState(state);

        // When doing the capture
        const move: PenteMove = PenteMove.of(new Coord(9, 6));
        await testUtils.expectMoveSuccess('#click-9-6', move);

        // Then it should show it
        testUtils.expectElementToExist('#capture-9-8');
        testUtils.expectElementToExist('#capture-9-7');
        testUtils.expectElementNotToExist('#capture-9-6');
        testUtils.expectElementToHaveClass('#piece-9-6', 'last-move-stroke');
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
        ], PlayerNumberMap.of(0, 0), 6);
        // When displaying it
        await testUtils.setupState(state);
        // Then it should show the victory
        testUtils.expectElementToHaveClass('#piece-9-9', 'victory-stroke');
        testUtils.expectElementToHaveClass('#piece-10-9', 'victory-stroke');
        testUtils.expectElementToHaveClass('#piece-11-9', 'victory-stroke');
        testUtils.expectElementToHaveClass('#piece-12-9', 'victory-stroke');
        testUtils.expectElementToHaveClass('#piece-13-9', 'victory-stroke');
    }));

    it('should show hoshis', fakeAsync(async() => {
        // Given a state
        // When displaying it
        // Then it should show the visible hoshis
        testUtils.expectElementToExist('#hoshi-3-3');
        testUtils.expectElementToExist('#hoshi-3-9');
        testUtils.expectElementToExist('#hoshi-3-15');
        testUtils.expectElementToExist('#hoshi-9-3');
        testUtils.expectElementToExist('#hoshi-9-9');
        testUtils.expectElementToExist('#hoshi-9-15');
        testUtils.expectElementToExist('#hoshi-15-3');
        testUtils.expectElementToExist('#hoshi-15-9');
        testUtils.expectElementToExist('#hoshi-15-15');
    }));
});
