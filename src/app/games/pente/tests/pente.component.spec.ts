import { fakeAsync } from '@angular/core/testing';
import { GameInfo } from 'src/app/components/normal-component/pick-game/pick-game.component';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PenteComponent } from '../pente.component';
import { PenteMove } from '../PenteMove';
import { PenteRules } from '../PenteRules';
import { PenteState } from '../PenteState';

fdescribe('PenteComponent', () => {

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
        await testUtils.expectMoveSuccess('#click_4_2', move);
    }));
    it('should forbid dropping on a piece already on the board', fakeAsync(async() => {
        // Given a state
        // When clicking on square with a piece
        // Then the move should fail
        const move: PenteMove = PenteMove.of(new Coord(9, 9));
        await testUtils.expectMoveFailure('#click_4_2', RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE(), move);
    }));
    it('should show last move', fakeAsync(async() => {
        // Given a state
        // When doing a move
        const move: PenteMove = PenteMove.of(new Coord(4, 2));
        await testUtils.expectMoveSuccess('#click_4_2', move);
        // Then it should show the last move
        testUtils.expectElementToHaveClass('#piece_4_2', 'last-move');
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
        const move: PenteMove = PenteMove.of(new Coord(9, 6));
        await testUtils.expectMoveSuccess('#click_9_6', move);

        // Then it should show it
        testUtils.expectElementToExist('#capture_9_8');
        testUtils.expectElementToExist('#capture_9_7');
        testUtils.expectElementNotToExist('#capture_9_6');
        testUtils.expectElementToHaveClass('#piece_9_6', 'last-move');
    }));
});
