import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { DiaballikComponent } from '../diaballik.component';
import { DiaballikMove, DiaballikPass, DiaballikTranslation } from '../DiaballikMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { DiaballikPiece, DiaballikState } from '../DiaballikState';
import { DiaballikFailure } from '../DiaballikRules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

fdescribe('DiaballikComponent', () => {

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
    it('should finish the move when clicking on the done button', fakeAsync(async() => {
        // Given a state
        // When doing some translation and then clicking on 'done'
        console.log('click 1')
        await testUtils.expectClickSuccess('#click_0_6');
        console.log('click 2')
        await testUtils.expectClickSuccess('#click_0_5');
        console.log(testUtils.getGameComponent().showDoneButton())
        const move: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.empty(),
                              MGPOptional.empty());
        // Then it should succeed
        await testUtils.expectMoveSuccess('#done', move);
    }));
    it('should finish the move upon selection of the third sub move', fakeAsync(async() => {
        // Given a state
        // When doing two translations and then one pass
        await testUtils.expectClickSuccess('#click_0_6');
        await testUtils.expectClickSuccess('#click_0_5');
        await testUtils.expectClickSuccess('#click_1_6');
        await testUtils.expectClickSuccess('#click_1_5');
        await testUtils.expectClickSuccess('#click_3_6');
        const move: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.of(DiaballikTranslation.from(new Coord(1, 6), new Coord(1, 5)).get()),
                              MGPOptional.of(DiaballikPass.from(new Coord(3, 6), new Coord(4, 6)).get()));
        // Then it should succeed
        await testUtils.expectMoveSuccess('#click_4_6', move);
    }));
    fit('should show possible targets when selecting a piece without ball', fakeAsync(async() => {
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
    it('should forbid selecting a piece of the opponent', fakeAsync(async() => {
        // Given a state
        // When clicking on a piece of the opponent
        // Then it should fail
        await testUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    }));
    it('should forbid passing the ball to an opponent', fakeAsync(async() => {
        // Given a state where the piece with the ball has been selected
        await testUtils.expectClickSuccess('#click_3_6');
        // When passing the ball to the opponent
        // Then it should fail
        await testUtils.expectClickFailure('#click_3_0', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
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
    it('should forbid moving more than one space at a time', fakeAsync(async() => {
        // Given a state
        // When moving a piece by multiple spaces
        await testUtils.expectClickSuccess('#click_0_6');
        // Then it should fail
        await testUtils.expectClickFailure('#click_0_3', DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
    }));
    it('should show the last move', fakeAsync(async() => {
        // Given a state with a last move
        // When displaying it
        await testUtils.expectClickSuccess('#click_0_6');
        await testUtils.expectClickSuccess('#click_0_5');
        await testUtils.expectClickSuccess('#click_1_6');
        await testUtils.expectClickSuccess('#click_1_5');
        await testUtils.expectClickSuccess('#click_3_6');
        const move: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.of(DiaballikTranslation.from(new Coord(1, 6), new Coord(1, 5)).get()),
                              MGPOptional.of(DiaballikPass.from(new Coord(3, 6), new Coord(4, 6)).get()));
        await testUtils.expectMoveSuccess('#click_4_6', move);
        // Then it should show the last move
        testUtils.expectElementToHaveClass('#space_0_6', 'last-move-fill');
        testUtils.expectElementToHaveClass('#space_0_5', 'last-move-fill');
        testUtils.expectElementToHaveClass('#piece_0_5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#space_1_6', 'last-move-fill');
        testUtils.expectElementToHaveClass('#space_1_5', 'last-move-fill');
        testUtils.expectElementToHaveClass('#piece_1_5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#space_3_6', 'last-move-fill');
        testUtils.expectElementToHaveClass('#space_4_6', 'last-move-fill');
        // Only the ball is highlighted for the pass
        testUtils.expectElementNotToHaveClass('#piece_4_6', 'last-move-stroke');
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
        testUtils.expectElementToHaveClass('#victory_4_0', 'victory-stroke');
    }));
    it('should show the defeat upon blocking the opponent', fakeAsync(async() => {
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
        testUtils.expectElementToHaveClass('#defeat_0_4', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#defeat_1_5', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#defeat_2_6', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#defeat_3_6', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#defeat_4_6', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#defeat_5_6', 'defeat-stroke');
        testUtils.expectElementToHaveClass('#defeat_6_6', 'defeat-stroke');
    }));
});
