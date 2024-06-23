/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { DiaballikComponent } from '../diaballik.component';
import { DiaballikMove, DiaballikBallPass, DiaballikTranslation } from '../DiaballikMove';
import { MGPOptional } from '@everyboard/lib';
import { Coord } from 'src/app/jscaip/Coord';
import { DiaballikPiece, DiaballikState } from '../DiaballikState';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { DiaballikFailure } from '../DiaballikFailure';
import { DiaballikRules } from '../DiaballikRules';

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
        await testUtils.expectClickSuccess('#click_0_6');
        await testUtils.expectClickSuccess('#click_0_5');

        // When clicking on the 'done' button
        const move: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.empty(),
                              MGPOptional.empty());

        // Then it should succeed
        await testUtils.expectMoveSuccess('#done', move);
    }));

    it('should finish the move when clicking on the done button after two sub moves', fakeAsync(async() => {
        // Given a state with two submoves already done
        await testUtils.expectClickSuccess('#click_0_6');
        await testUtils.expectClickSuccess('#click_0_5');
        await testUtils.expectClickSuccess('#click_1_6');
        await testUtils.expectClickSuccess('#click_1_5');

        // When clicking on 'done'
        const move: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.of(DiaballikTranslation.from(new Coord(1, 6), new Coord(1, 5)).get()),
                              MGPOptional.empty());

        // Then it should succeed
        await testUtils.expectMoveSuccess('#done', move);
    }));

    it('should finish the move upon selection of the third sub move', fakeAsync(async() => {
        // Given a state where we did two submoves and almost entirely the third one
        await testUtils.expectClickSuccess('#click_0_6');
        await testUtils.expectClickSuccess('#click_0_5');
        await testUtils.expectClickSuccess('#click_1_6');
        await testUtils.expectClickSuccess('#click_1_5');
        await testUtils.expectClickSuccess('#click_3_6');

        // When clicking on the last target for the move
        const move: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.of(DiaballikTranslation.from(new Coord(1, 6), new Coord(1, 5)).get()),
                              MGPOptional.of(DiaballikBallPass.from(new Coord(3, 6), new Coord(4, 6)).get()));

        // Then it should do the move
        await testUtils.expectMoveSuccess('#click_4_6', move);
    }));

    it('should cancel move when deselecting the first selected piece', fakeAsync(async() => {
        // Given a state where a piece has been selected
        await testUtils.expectClickSuccess('#click_0_6');
        testUtils.expectElementToHaveClass('#piece_0_6', 'selected-stroke');

        // When clicking on it a second time
        // Then it should cancel the move and deselect the piece
        await testUtils.expectClickFailure('#click_0_6');
        testUtils.expectElementNotToHaveClass('#piece_0_6', 'selected-stroke');
    }));

    it('should deselect piece when clicking a second time on it', fakeAsync(async() => {
        // Given a state where a sub move has been done and a piece selected
        await testUtils.expectClickSuccess('#click_0_6');
        await testUtils.expectClickSuccess('#click_0_5');
        await testUtils.expectClickSuccess('#click_1_6');
        testUtils.expectElementToHaveClass('#piece_1_6', 'selected-stroke');

        // When deselecting the selected piece
        await testUtils.expectClickSuccess('#click_1_6');

        // Then it should not cancel the move but just deselect the piece
        testUtils.expectElementNotToHaveClass('#piece_1_6', 'selected-stroke');
    }));

    it('should show possible targets when selecting a piece without ball', fakeAsync(async() => {
        // Given a state

        // When selecting a piece without ball
        await testUtils.expectClickSuccess('#click_0_6');

        // Then it should show indicators on its possible targets
        testUtils.expectElementToExist('#indicator_0_5');
        testUtils.expectElementNotToExist('#indicator_1_5'); // diagonal is not a target
        testUtils.expectElementNotToExist('#indicator_1_6'); // occupied space is not a target
    }));

    it('should show possible targets when selecting the piece with the ball', fakeAsync(async() => {
        // Given a state

        // When selecting the piece with the ball
        await testUtils.expectClickSuccess('#click_3_6');

        // Then it should show indicators on its possible targets
        testUtils.expectElementToExist('#indicator_2_6');
        testUtils.expectElementToExist('#indicator_4_6');
        testUtils.expectElementNotToExist('#indicator_0_6'); // obstructed path, not a target
    }));

    it('should forbid selecting the piece that holds the ball if a pass has already been done', fakeAsync(async() => {
        // Given a state where a pass has already been done for the current move
        await testUtils.expectClickSuccess('#click_3_6');
        await testUtils.expectClickSuccess('#click_2_6');

        // When selecting the piece with the ball
        // Then it should fail
        await testUtils.expectClickFailure('#click_2_6', DiaballikFailure.CAN_ONLY_DO_ONE_PASS());
    }));

    it('should forbid selecting the empty piece', fakeAsync(async() => {
        // Given a state

        // When clicking on an empty space
        // Then it should fail
        await testUtils.expectClickFailure('#click_2_2', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
    }));

    it('should forbid selecting a piece of the opponent', fakeAsync(async() => {
        // Given a state

        // When clicking on a piece of the opponent
        // Then it should fail
        await testUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
    }));

    it('should forbid passing the ball to an opponent', fakeAsync(async() => {
        // Given a state where the piece with the ball has been selected
        await testUtils.expectClickSuccess('#click_3_6');

        // When passing the ball to the opponent
        // Then it should fail
        await testUtils.expectClickFailure('#click_3_0', DiaballikFailure.CANNOT_PASS_TO_OPPONENT());
    }));

    it('should forbid moving on another piece', fakeAsync(async() => {
        // Given a state

        // When trying to move on another piece
        await testUtils.expectClickSuccess('#click_0_6');

        // Then it should fail
        await testUtils.expectClickFailure('#click_1_6', RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
    }));

    it('should forbid moving diagonally', fakeAsync(async() => {
        // Given a state

        // When moving a piece diagonally
        await testUtils.expectClickSuccess('#click_0_6');

        // Then it should fail
        await testUtils.expectClickFailure('#click_1_5', DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
    }));

    it('should forbid passing not in a straight line', fakeAsync(async() => {
        // Given a state in construction where a strange pass is possible (but illegal)
        await testUtils.expectClickSuccess('#click_4_6');
        await testUtils.expectClickSuccess('#click_4_5');
        await testUtils.expectClickSuccess('#click_4_5');
        await testUtils.expectClickSuccess('#click_4_4');
        await testUtils.expectClickSuccess('#click_3_6');

        // When trying to pass along a non-straight line
        // Then it should fail
        await testUtils.expectClickFailure('#click_4_4', DiaballikFailure.PASS_MUST_BE_IN_STRAIGHT_LINE());
    }));

    it('should forbid moving more than one space at a time', fakeAsync(async() => {
        // Given a state

        // When moving a piece by multiple spaces
        await testUtils.expectClickSuccess('#click_0_6');

        // Then it should fail
        await testUtils.expectClickFailure('#click_0_3', DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
    }));

    it('should forbid selecting a piece for a third translation', fakeAsync(async() => {
        // Given a state where two translations have already been done
        await testUtils.expectClickSuccess('#click_0_6');
        await testUtils.expectClickSuccess('#click_0_5');
        await testUtils.expectClickSuccess('#click_1_6');
        await testUtils.expectClickSuccess('#click_1_5');

        // When selecting a third piece for a translation
        // Then it should fail
        await testUtils.expectClickFailure('#click_2_6', DiaballikFailure.CAN_ONLY_TRANSLATE_TWICE());
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
        testUtils.expectElementToHaveClass('#space_0_6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space_0_5', 'moved-fill');
        testUtils.expectElementToHaveClass('#piece_0_5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#space_1_6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space_1_5', 'moved-fill');
        testUtils.expectElementToHaveClass('#piece_1_5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#space_3_6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space_4_6', 'moved-fill');
        // Only the ball is highlighted for the pass
        testUtils.expectElementNotToHaveClass('#piece_4_6', 'last-move-stroke');
        testUtils.expectElementToHaveClass('#ball_4_6', 'last-move-stroke');
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
        await testUtils.expectClickSuccess('#click_0_0');

        // Then it should not show the last move anymore
        testUtils.expectElementNotToHaveClass('#space_0_6', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#space_0_5', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#piece_0_5', 'last-move-stroke');

        testUtils.expectElementNotToHaveClass('#space_1_6', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#space_1_5', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#piece_1_5', 'last-move-stroke');

        testUtils.expectElementNotToHaveClass('#space_3_6', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#space_4_6', 'moved-fill');
        testUtils.expectElementNotToHaveClass('#ball_4_6', 'last-move-stroke');
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
        await testUtils.expectClickSuccess('#click_0_0');

        // When deselecting the piece
        await testUtils.expectClickFailure('#click_0_0');

        // Then the last move should appear again
        testUtils.expectElementToHaveClass('#space_0_6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space_0_5', 'moved-fill');
        testUtils.expectElementToHaveClass('#piece_0_5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#space_1_6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space_1_5', 'moved-fill');
        testUtils.expectElementToHaveClass('#piece_1_5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#space_3_6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space_4_6', 'moved-fill');
        testUtils.expectElementToHaveClass('#ball_4_6', 'last-move-stroke');
    }));

    it('should show move being constructed as last move', fakeAsync(async() => {
        // Given a state

        // When doing submoves
        await testUtils.expectClickSuccess('#click_0_6');
        await testUtils.expectClickSuccess('#click_0_5');

        await testUtils.expectClickSuccess('#click_3_6');
        await testUtils.expectClickSuccess('#click_4_6');

        // Then they should be shown as last move
        testUtils.expectElementToHaveClass('#space_0_6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space_0_5', 'moved-fill');
        testUtils.expectElementToHaveClass('#piece_0_5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#space_3_6', 'moved-fill');
        testUtils.expectElementToHaveClass('#space_4_6', 'moved-fill');
        testUtils.expectElementToHaveClass('#ball_4_6', 'last-move-stroke');
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
        testUtils.expectElementToHaveClass('#piece_4_0', 'victory-stroke');
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
        testUtils.expectElementToHaveClass('#piece_0_4', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece_1_5', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece_2_6', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece_3_6', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece_4_6', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece_5_6', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece_6_6', 'defeat-stroke');
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
        testUtils.expectElementToHaveClass('#piece_0_3', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece_1_4', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece_2_4', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece_3_5', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece_4_4', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece_5_3', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#piece_6_2', 'defeat-stroke');
    }));

    it('should show the number of translations and passes made', fakeAsync(async() => {
        // Given a state where no translation or pass has been made at this turn
        testUtils.expectTextToBe('#translationCount', '0');
        testUtils.expectTextToBe('#passCount', '0');

        // When doing a translation and pass
        await testUtils.expectClickSuccess('#click_0_6');
        await testUtils.expectClickSuccess('#click_0_5');
        await testUtils.expectClickSuccess('#click_3_6');
        await testUtils.expectClickSuccess('#click_4_6');

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
