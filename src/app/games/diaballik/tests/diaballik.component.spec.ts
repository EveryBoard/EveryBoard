import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { DiaballikComponent } from '../diaballik.component';
import { DiaballikMove, DiaballikPass, DiaballikTranslation } from '../DiaballikMove';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { DiaballikPiece, DiaballikState } from '../DiaballikState';

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
    it('should finish the move when clicking on the done button', fakeAsync(async() => {
        // Given a state
        // When doing some translation and then clicking on 'done'
        testUtils.expectClickSuccess('#piece_0_6');
        testUtils.expectClickSuccess('#piece_0_5');
        const move: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.empty(),
                              MGPOptional.empty());
        // Then it should succeed
        testUtils.expectMoveSuccess('#done', move);
    }));
    it('should finish the move upon selection of the third sub move', fakeAsync(async() => {
        // Given a state
        // When doing two translations and then one pass
        testUtils.expectClickSuccess('#piece_0_6');
        testUtils.expectClickSuccess('#piece_0_5');
        testUtils.expectClickSuccess('#piece_1_6');
        testUtils.expectClickSuccess('#piece_1_5');
        testUtils.expectClickSuccess('#piece_3_6');
        const move: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.of(DiaballikTranslation.from(new Coord(1, 6), new Coord(1, 5)).get()),
                              MGPOptional.of(DiaballikPass.from(new Coord(3, 6), new Coord(4, 6)).get()));
        // Then it should succeed
        testUtils.expectMoveSuccess('#piece_4_6', move);
    }));
    it('should show possible targets when selecting a piece without ball', fakeAsync(async() => {
        // Given a state
        // When selecting a piece without ball
        testUtils.expectClickSuccess('#piece_0_6');
        // Then it should show indicators on its possible targets
        testUtils.expectElementToExist('#indicator_0_5');
        testUtils.expectElementNotToExist('#indicator_1_5'); // diagonal is not a target
        testUtils.expectElementNotToExist('#indicator_1_6'); // occupied space is not a target
    }));
    it('should show possible targets when selecting the piece with the ball', fakeAsync(async() => {
        // Given a state
        // When selecting the piece with the ball
        testUtils.expectClickSuccess('#piece_3_6');
        // Then it should show indicators on its possible targets
        testUtils.expectElementToExist('#indicator_2_6');
        testUtils.expectElementToExist('#indicator_4_6');
        testUtils.expectElementNotToExist('#indicator_0_6'); // obstructed path, not a target
    }));
    it('should forbid selecting the piece that holds the ball if a pass has already been done', fakeAsync(async() => {
        // TODO: can the pass be done mid-mode or is it only the last part of the move?
    }));
    it('should show the last move', fakeAsync(async() => {
        // Given a state with a last move
        // When displaying it
        testUtils.expectClickSuccess('#piece_0_6');
        testUtils.expectClickSuccess('#piece_0_5');
        testUtils.expectClickSuccess('#piece_1_6');
        testUtils.expectClickSuccess('#piece_1_5');
        testUtils.expectClickSuccess('#piece_3_6');
        const move: DiaballikMove =
            new DiaballikMove(DiaballikTranslation.from(new Coord(0, 6), new Coord(0, 5)).get(),
                              MGPOptional.of(DiaballikTranslation.from(new Coord(1, 6), new Coord(1, 5)).get()),
                              MGPOptional.of(DiaballikPass.from(new Coord(3, 6), new Coord(4, 6)).get()));
        testUtils.expectMoveSuccess('#piece_4_6', move);
        // Then it should show the last move
        testUtils.expectElementToHaveClass('#square_0_6', 'last-move');
        testUtils.expectElementToHaveClass('#square_0_5', 'last-move');
        testUtils.expectElementToHaveClass('#piece_0_5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#square_1_6', 'last-move');
        testUtils.expectElementToHaveClass('#square_1_5', 'last-move');
        testUtils.expectElementToHaveClass('#piece_1_5', 'last-move-stroke');

        testUtils.expectElementToHaveClass('#square_3_6', 'last-move');
        testUtils.expectElementToHaveClass('#square_3_5', 'last-move');
        testUtils.expectElementToHaveClass('#piece_3_5', 'last-move-stroke');
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
        testUtils.setupState(state);
        // Then it should show the victory
        testUtils.expectElementToHaveClass('#piece_3_0', 'victory-stroke');
    }));
});
