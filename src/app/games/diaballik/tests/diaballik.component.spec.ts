/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';


import { Coord } from '@everyboard/games';
import { RulesFailure } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { ComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { DiaballikFailure } from '../DiaballikFailure';
import { DiaballikMove, DiaballikBallPass, DiaballikTranslation } from '../DiaballikMove';
import { DiaballikRules } from '../DiaballikRules';
import { DiaballikPiece, DiaballikState } from '../DiaballikState';
import { DiaballikComponent } from '../diaballik.component';

describe('DiaballikComponent', () => {

    let testUtils: ComponentTestUtils<DiaballikComponent>;

    const O: DiaballikPiece = DiaballikPiece.ZERO;
    const Ȯ: DiaballikPiece = DiaballikPiece.ZERO_WITH_BALL;
    const X: DiaballikPiece = DiaballikPiece.ONE;
    const Ẋ: DiaballikPiece = DiaballikPiece.ONE_WITH_BALL;
    const _: DiaballikPiece = DiaballikPiece.NONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<DiaballikComponent>('Diaballik');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    it('should finish the move when clicking on the done button after one sub move', fakeAsync(async() => {
        // Given a state with a submove already done
        await testUtils.expectClickSuccess('#click-0-6');
        await testUtils.expectClickSuccess('#click-0-5');

        // When clicking on the 'done' button
        const move: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.empty(),
                              MGPOptional.empty());

        // Then the move should succeed
        await testUtils.expectMoveSuccess('#done', move);
    }));

    it('should finish the move when clicking on the done button after two sub moves', fakeAsync(async() => {
        // Given a state with two submoves already done
        await testUtils.expectClickSuccess('#click-0-6');
        await testUtils.expectClickSuccess('#click-0-5');
        await testUtils.expectClickSuccess('#click-1-6');
        await testUtils.expectClickSuccess('#click-1-5');

        // When clicking on 'done'
        const move: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.of(DiaballikTranslation.from(new Coord(1, 6), new Coord(1, 5)).get()),
                              MGPOptional.empty());

        // Then the move should succeed
        await testUtils.expectMoveSuccess('#done', move);
    }));

    it('should finish the move upon selection of the third sub move', fakeAsync(async() => {
        // Given a state where we did two submoves and almost entirely the third one
        await testUtils.expectClickSuccess('#click-0-6');
        await testUtils.expectClickSuccess('#click-0-5');
        await testUtils.expectClickSuccess('#click-1-6');
        await testUtils.expectClickSuccess('#click-1-5');
        await testUtils.expectClickSuccess('#click-3-6');

        // When clicking on the last target for the move
        const move: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.of(DiaballikTranslation.from(new Coord(1, 6), new Coord(1, 5)).get()),
                              MGPOptional.of(DiaballikBallPass.from(new Coord(3, 6), new Coord(4, 6)).get()));

        // Then it should do the move
        await testUtils.expectMoveSuccess('#click-4-6', move);
    }));

    it('should cancel move when deselecting the first selected piece', fakeAsync(async() => {
        // Given a state where a piece has been selected
        await testUtils.expectClickSuccess('#click-0-6');
        testUtils.expectElementToHaveClass('#piece-0-6', 'selected-stroke');

        // When clicking on it a second time
        // Then it should cancel the move and deselect the piece
        await testUtils.expectClickFailure('#click-0-6');
        testUtils.expectElementNotToHaveClass('#piece-0-6', 'selected-stroke');
    }));

    it('should deselect piece when clicking a second time on it', fakeAsync(async() => {
        // Given a state where a sub move has been done and a piece selected
        await testUtils.expectClickSuccess('#click-0-6');
        await testUtils.expectClickSuccess('#click-0-5');
        await testUtils.expectClickSuccess('#click-1-6');
        testUtils.expectElementToHaveClass('#piece-1-6', 'selected-stroke');

        // When deselecting the selected piece
        await testUtils.expectClickSuccess('#click-1-6');

        // Then it should not cancel the move but just deselect the piece
        testUtils.expectElementNotToHaveClass('#piece-1-6', 'selected-stroke');
    }));

    it('should show possible targets when selecting a piece without ball', fakeAsync(async() => {
        // Given a state

        // When selecting a piece without ball
        await testUtils.expectClickSuccess('#click-0-6');

        // Then it should show indicators on its possible targets
        testUtils.expectElementToExist('#indicator-0-5');
        testUtils.expectElementNotToExist('#indicator-1-5'); // diagonal is not a target
        testUtils.expectElementNotToExist('#indicator-1-6'); // occupied space is not a target
    }));

    it('should show possible targets when selecting the piece with the ball', fakeAsync(async() => {
        // Given a state

        // When selecting the piece with the ball
        await testUtils.expectClickSuccess('#click-3-6');

        // Then it should show indicators on its possible targets
        testUtils.expectElementToExist('#indicator-2-6');
        testUtils.expectElementToExist('#indicator-4-6');
        testUtils.expectElementNotToExist('#indicator-0-6'); // obstructed path, not a target
    }));

    it('should forbid selecting the piece that holds the ball if a pass has already been done', fakeAsync(async() => {
        // Given a state where a pass has already been done for the current move
        await testUtils.expectClickSuccess('#click-3-6');
        await testUtils.expectClickSuccess('#click-2-6');

        // When selecting the piece with the ball
        // Then it should fail
        await testUtils.expectClickFailure('#click-2-6', DiaballikFailure.CAN_ONLY_DO_ONE_PASS());
    }));

    it('should forbid selecting the empty piece', fakeAsync(async() => {
        // Given a state

        // When clicking on an empty space
        // Then it should fail
        await testUtils.expectClickFailure('#click-2-2', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
    }));

    it('should forbid selecting a piece of the opponent', fakeAsync(async() => {
        // Given a state

        // When clicking on a piece of the opponent
        // Then it should fail
        await testUtils.expectClickFailure('#click-0-0', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
    }));

    it('should forbid passing the ball to an opponent', fakeAsync(async() => {
        // Given a state where the piece with the ball has been selected
        await testUtils.expectClickSuccess('#click-3-6');

        // When passing the ball to the opponent
        // Then it should fail
        await testUtils.expectClickFailure('#click-3-0', DiaballikFailure.CANNOT_PASS_TO_OPPONENT());
    }));

    it('should forbid moving on another piece', fakeAsync(async() => {
        // Given a state

        // When trying to move on another piece
        await testUtils.expectClickSuccess('#click-0-6');

        // Then it should fail
        await testUtils.expectClickFailure('#click-1-6', RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
    }));

    it('should forbid moving diagonally', fakeAsync(async() => {
        // Given a state

        // When moving a piece diagonally
        await testUtils.expectClickSuccess('#click-0-6');

        // Then it should fail
        await testUtils.expectClickFailure('#click-1-5', DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
    }));

    it('should forbid passing not in a straight line', fakeAsync(async() => {
        // Given a state in construction where a strange pass is possible (but illegal)
        await testUtils.expectClickSuccess('#click-4-6');
        await testUtils.expectClickSuccess('#click-4-5');
        await testUtils.expectClickSuccess('#click-4-5');
        await testUtils.expectClickSuccess('#click-4-4');
        await testUtils.expectClickSuccess('#click-3-6');

        // When trying to pass along a non-straight line
        // Then it should fail
        await testUtils.expectClickFailure('#click-4-4', DiaballikFailure.PASS_MUST_BE_IN_STRAIGHT_LINE());
    }));

    it('should forbid moving more than one space at a time', fakeAsync(async() => {
        // Given a state

        // When moving a piece by multiple spaces
        await testUtils.expectClickSuccess('#click-0-6');

        // Then it should fail
        await testUtils.expectClickFailure('#click-0-3', DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
    }));

    it('should forbid selecting a piece for a third translation', fakeAsync(async() => {
        // Given a state where two translations have already been done
        await testUtils.expectClickSuccess('#click-0-6');
        await testUtils.expectClickSuccess('#click-0-5');
        await testUtils.expectClickSuccess('#click-1-6');
        await testUtils.expectClickSuccess('#click-1-5');

        // When selecting a third piece for a translation
        // Then it should fail
        await testUtils.expectClickFailure('#click-2-6', DiaballikFailure.CAN_ONLY_TRANSLATE_TWICE());
    }));

    it('should show the last move', fakeAsync(async() => {
        // Given a state with a last move
        const state: DiaballikState = new DiaballikState([
            [X, X, X, Ẋ, X, X, X],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [O, O, _, _, _, _, _],
            [_, _, O, O, Ȯ, O, O],
        ], 0);
        const previousMove: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.of(DiaballikTranslation.from(new Coord(1, 6), new Coord(1, 5)).get()),
                              MGPOptional.of(DiaballikBallPass.from(new Coord(3, 6), new Coord(4, 6)).get()));
        const previousState: DiaballikState = DiaballikRules.get().getInitialState();

        // When displaying it
        await testUtils.setupState(state, { previousState, previousMove });

        // Then it should show the last move
        testUtils.expectElementToHaveClass('#space-0-6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space-0-5', 'moved-fill');
        testUtils.expectElementToHaveClass('#piece-0-5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#space-1-6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space-1-5', 'moved-fill');
        testUtils.expectElementToHaveClass('#piece-1-5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#space-3-6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space-4-6', 'moved-fill');
        // Only the ball is highlighted for the pass
        testUtils.expectElementNotToHaveClass('#piece-4-6', 'last-move-stroke');
        testUtils.expectElementToHaveClass('#ball-4-6', 'last-move-stroke');
    }));

    it('should not show last move upon construction of a new move', fakeAsync(async() => {
        // Given a state with a last move
        const state: DiaballikState = new DiaballikState([
            [X, X, X, Ẋ, X, X, X],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [O, O, _, _, _, _, _],
            [_, _, O, O, Ȯ, O, O],
        ], 1);
        const previousMove: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.of(DiaballikTranslation.from(new Coord(1, 6), new Coord(1, 5)).get()),
                              MGPOptional.of(DiaballikBallPass.from(new Coord(3, 6), new Coord(4, 6)).get()));
        const previousState: DiaballikState = DiaballikRules.get().getInitialState();
        await testUtils.setupState(state, { previousState, previousMove });

        // When starting a new move
        await testUtils.expectClickSuccess('#click-0-0');

        // Then it should not show the last move anymore
        testUtils.expectElementNotToHaveClass('#space-0-6', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#space-0-5', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#piece-0-5', 'last-move-stroke');

        testUtils.expectElementNotToHaveClass('#space-1-6', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#space-1-5', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#piece-1-5', 'last-move-stroke');

        testUtils.expectElementNotToHaveClass('#space-3-6', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#space-4-6', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#ball-4-6', 'last-move-stroke');
    }));

    it('should show last move if current move is canceled by deselecting the first piece', fakeAsync(async() => {
        // Given a state with a last move and a selected piece
        const state: DiaballikState = new DiaballikState([
            [X, X, X, Ẋ, X, X, X],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [O, O, _, _, _, _, _],
            [_, _, O, O, Ȯ, O, O],
        ], 1);
        const previousMove: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.of(DiaballikTranslation.from(new Coord(1, 6), new Coord(1, 5)).get()),
                              MGPOptional.of(DiaballikBallPass.from(new Coord(3, 6), new Coord(4, 6)).get()));
        const previousState: DiaballikState = DiaballikRules.get().getInitialState();
        await testUtils.setupState(state, { previousState, previousMove });
        await testUtils.expectClickSuccess('#click-0-0');

        // When deselecting the piece
        await testUtils.expectClickFailure('#click-0-0');

        // Then the last move should appear again
        testUtils.expectElementToHaveClass('#space-0-6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space-0-5', 'moved-fill');
        testUtils.expectElementToHaveClass('#piece-0-5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#space-1-6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space-1-5', 'moved-fill');
        testUtils.expectElementToHaveClass('#piece-1-5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#space-3-6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space-4-6', 'moved-fill');
        testUtils.expectElementToHaveClass('#ball-4-6', 'last-move-stroke');
    }));

    it('should show move being constructed as last move', fakeAsync(async() => {
        // Given a state

        // When doing submoves
        await testUtils.expectClickSuccess('#click-0-6');
        await testUtils.expectClickSuccess('#click-0-5');

        await testUtils.expectClickSuccess('#click-3-6');
        await testUtils.expectClickSuccess('#click-4-6');

        // Then they should be shown as last move
        testUtils.expectElementToHaveClass('#space-0-6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space-0-5', 'moved-fill');
        testUtils.expectElementToHaveClass('#piece-0-5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#space-3-6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space-4-6', 'moved-fill');
        testUtils.expectElementToHaveClass('#ball-4-6', 'last-move-stroke');
    }));

    it('should show the victory', fakeAsync(async() => {
        // Given a state with victory
        const state: DiaballikState = new DiaballikState([
            [X, X, X, Ẋ, Ȯ, X, X],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [O, O, O, _, _, O, O],
        ], 0);

        // When displaying it
        await testUtils.setupState(state);

        // Then it should show the victory
        testUtils.expectElementToHaveClass('#piece-4-0', 'victory-stroke');
    }));

    it('should show the defeat upon blocking the opponent (Player.ZERO)', fakeAsync(async() => {
        // Given a state with a defeat due to blocking the opponent
        const state: DiaballikState = new DiaballikState([
            [X, X, X, Ẋ, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, X, _, _, _, _, _],
            [_, O, _, X, _, _, _],
            [_, _, O, Ȯ, O, O, O],
        ], 0);

        // When displaying it
        await testUtils.setupState(state);

        // Then it should show the defeat
        testUtils.expectElementToHaveClass('#piece-0-4', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece-1-5', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece-2-6', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece-3-6', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece-4-6', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece-5-6', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece-6-6', 'defeat-stroke');
    }));

    it('should show the defeat upon blocking the opponent (Player.ONE)', fakeAsync(async() => {
        // Given a state with a defeat due to blocking the opponent
        const state: DiaballikState = new DiaballikState([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, X],
            [X, _, _, _, _, X, _],
            [O, X, Ẋ, _, X, O, _],
            [_, O, _, X, _, _, _],
            [_, _, O, Ȯ, O, _, O],
        ], 0);

        // When displaying it
        await testUtils.setupState(state);

        // Then it should show the defeat
        testUtils.expectElementToHaveClass('#piece-0-3', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece-1-4', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece-2-4', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece-3-5', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece-4-4', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece-5-3', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece-6-2', 'defeat-stroke');
    }));

    it('should show the number of translations and passes made', fakeAsync(async() => {
        // Given a state where no translation or pass has been made at this turn
        testUtils.expectTextToBe('#translationCount', '0');
        testUtils.expectTextToBe('#passCount', '0');

        // When doing a translation and pass
        await testUtils.expectClickSuccess('#click-0-6');
        await testUtils.expectClickSuccess('#click-0-5');
        await testUtils.expectClickSuccess('#click-3-6');
        await testUtils.expectClickSuccess('#click-4-6');

        // Then it should increase the shown counts
        testUtils.expectTextToBe('#translationCount', '1');
        testUtils.expectTextToBe('#passCount', '1');
    }));

    it('should not show number of translations and passes when not interactive', fakeAsync(async() => {
        // Given a non-interactive component
        testUtils.expectElementToExist('#translationCount');
        testUtils.expectElementToExist('#passCount');
        testUtils.getGameComponent().setInteractive(false);

        // When displaying it
        // Then there should be no translation or pass count
        testUtils.expectElementNotToExist('#translationCount');
        testUtils.expectElementNotToExist('#passCount');
    }));

    it('should show the number of translations and passes in the color of the active player', fakeAsync(async() => {
        // Given a state at the turn of player 1
        const state: DiaballikState = new DiaballikState([
            [X, X, X, Ẋ, X, X, X],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, O, _],
            [O, O, O, Ȯ, O, _, O],
        ], 1);

        // When displaying it
        await testUtils.setupState(state);

        // Then it should display the translation and passes in the color of player 1
        testUtils.expectElementsToHaveClass('#passCountIndicator circle', 'player1-fill');
        testUtils.expectElementToHaveClass('#translationCountIndicator circle', 'player1-fill');
    }));

});
