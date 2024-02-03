/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';

import { SiamComponent } from '../siam.component';
import { SiamMove } from 'src/app/games/siam/SiamMove';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { SiamPiece } from 'src/app/games/siam/SiamPiece';
import { Table } from 'src/app/utils/ArrayUtils';
import { SiamState } from 'src/app/games/siam/SiamState';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { SiamFailure } from '../SiamFailure';
import { SiamRules } from '../SiamRules';

describe('SiamComponent', () => {

    let testUtils: ComponentTestUtils<SiamComponent>;

    const _: SiamPiece = SiamPiece.EMPTY;
    const M: SiamPiece = SiamPiece.MOUNTAIN;
    const U: SiamPiece = SiamPiece.LIGHT_UP;
    const u: SiamPiece = SiamPiece.DARK_UP;
    const rules: SiamRules = SiamRules.get();

    async function expectMoveToBeLegal(player: Player, move: SiamMove, state: SiamState): Promise<void> {
        if (rules.isInsertion(move, state)) {
            await testUtils.expectClickSuccess('#remainingPieces_' + player.getValue());
            const target: Coord = move.coord.getNext(move.direction.get());
            await testUtils.expectClickSuccess('#square_' + target.x + '_' + target.y);
            const orientation: string = move.landingOrientation.toString();
            return testUtils.expectMoveSuccess('#orientation_' + orientation, move);
        } else {
            await testUtils.expectClickSuccess('#square_' + move.coord.x + '_' + move.coord.y);
            const target: Coord = move.direction.isPresent() ? move.coord.getNext(move.direction.get()) : move.coord;
            await testUtils.expectClickSuccess('#square_' + target.x + '_' + target.y);
            const landingOrientation: string = move.landingOrientation.toString();
            return testUtils.expectMoveSuccess('#orientation_' + landingOrientation, move);
        }
    }

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<SiamComponent>('Siam');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    it('should accept insertion at first turn', fakeAsync(async() => {
        // Given the initial state
        // When inserting a piece
        await testUtils.expectClickSuccess('#remainingPieces_0');
        await testUtils.expectClickSuccess('#square_2_0');
        const move: SiamMove = SiamMove.of(2, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN);
        // Then it should succeed
        await testUtils.expectMoveSuccess('#orientation_DOWN', move);
    }));

    it('should forbid to select opponent pieces for insertion', fakeAsync(async() => {
        // Given the initial state
        // When trying to select an opponent's piece for insertion
        // Then it should fail
        await testUtils.expectClickFailure('#remainingPieces_1', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
    }));

    it('should select piece when clicking first time', fakeAsync(async() => {
        // Given a component
        // When the player clicks on a piece for insertion
        await testUtils.expectClickSuccess('#remainingPieces_0');
        // Then it should be selected
        testUtils.expectElementToHaveClass('#remainingPieces_0_4', 'selected-stroke');
    }));

    it('should deselect piece when clicking a second time on it', fakeAsync(async() => {
        // Given a component where the player has selected a piece for insertion
        await testUtils.expectClickSuccess('#remainingPieces_0');
        // When clicking a second time on the remaining pieces
        await testUtils.expectClickSuccess('#remainingPieces_0');
        // Then it should deselect the piece
        testUtils.expectElementNotToHaveClass('#remainingPieces_0_4', 'selected-stroke');
    }));

    it('should forbid to select opponent pieces for move', fakeAsync(async() => {
        // Given a state with a piece of the opponent
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 0);
        await testUtils.setupState(state);

        // When trying to select the opponent's piece
        // Then it should fail
        await testUtils.expectClickFailure('#square_4_4', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
    }));

    it('should allow rotation', fakeAsync(async() => {
        // Given a state with one piece
        const board: Table<SiamPiece> = [
            [u, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        await testUtils.setupState(state);

        // When performing a rotation
        // Then it should succeed
        const move: SiamMove = SiamMove.of(0, 0, MGPOptional.empty(), Orthogonal.DOWN);
        await expectMoveToBeLegal(Player.ZERO, move, state);
    }));

    it('should allow normal move', fakeAsync(async() => {
        // Given a state with a piece
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, u],
        ];
        const state: SiamState = new SiamState(board, 0);
        await testUtils.setupState(state);

        // When moving forward
        // Then it should succeed
        const move: SiamMove = SiamMove.of(4, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        await expectMoveToBeLegal(Player.ZERO, move, state);
    }));

    it('should highlight all moved pieces upon move', fakeAsync(async() => {
        // Given a state with a piece
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, u],
        ];
        const state: SiamState = new SiamState(board, 0);
        await testUtils.setupState(state);

        // When performing a move
        const move: SiamMove = SiamMove.of(5, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        await expectMoveToBeLegal(Player.ZERO, move, state);

        // Then the moved piece and departed square should be shown as moved
        testUtils.expectElementToHaveClasses('#square_4_4', ['base', 'moved-fill']);
        testUtils.expectElementToHaveClasses('#square_3_4', ['base', 'moved-fill']);
        testUtils.expectElementToHaveClasses('#square_2_4', ['base']);
    }));

    it('should decide exit orientation automatically', fakeAsync(async() => {
        // Given a board with a piece next to the border
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, u],
        ];
        const state: SiamState = new SiamState(board, 0);
        await testUtils.setupState(state);

        // When making the piece exit the board
        // Then the orientation of the piece does not have to be chosen
        await testUtils.expectClickSuccess('#square_4_4');
        const move: SiamMove = SiamMove.of(4, 4, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN);
        await testUtils.expectMoveSuccess('#square_4_5', move);
    }));

    it('should toast when clicking as first click on an empty square', fakeAsync(async() => {
        // Given the initial board
        // When clicking on an empty piece
        // Then a toast should say it's forbidden
        const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
        await testUtils.expectClickFailure('#square_2_1', reason);
    }));

    it('should fail when player clicks on the board instead of an orientation arrow', fakeAsync(async() => {
        // Given a component on which the player has selected a piece for insertion, and a target,
        // and must select an orientation arrow
        await testUtils.expectClickSuccess('#remainingPieces_0');
        await testUtils.expectClickSuccess('#square_0_0');
        // When clicking somewhere else on the board
        // Then it should fail
        await testUtils.expectClickFailure('#square_2_2', SiamFailure.MUST_SELECT_ORIENTATION());
    }));

    it('should fail when player selects an invalid target for insertion (empty)', fakeAsync(async() => {
        // Given a component on which the player has selected a piece for insertion,
        // and must select the target for a move
        await testUtils.expectClickSuccess('#remainingPieces_0');
        // When the player clicks on an empty target which would result in an impossible move
        // Then it should fail
        await testUtils.expectClickFailure('#square_1_1', SiamFailure.MUST_SELECT_VALID_DESTINATION());
    }));

    it('should fail when player selects an invalid target for insertion (mountain)', fakeAsync(async() => {
        // Given a component on which the player has selected a piece for insertion,
        // and must select the target for a move
        await testUtils.expectClickSuccess('#remainingPieces_0');
        // When the player clicks on an invalid target which would result in an impossible move
        // Then the move should be canceled
        await testUtils.expectClickFailure('#square_2_2', SiamFailure.MUST_SELECT_VALID_DESTINATION());
    }));

    it('should select the other piece when player selects another piece instead of a target', fakeAsync(async() => {
        // Given a state with a piece, and the player being in the middle of creating a move
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, u, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        await testUtils.setupState(state);
        await testUtils.expectClickSuccess('#remainingPieces_0');

        // When the player clicks on the piece on the board
        await testUtils.expectClickSuccess('#square_3_3');

        // Then a new move should be in creation and the player should be able to finish the move
        await testUtils.expectClickSuccess('#square_3_4');
        const move: SiamMove = SiamMove.of(3, 3, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN);
        await testUtils.expectMoveSuccess('#orientation_DOWN', move);
    }));

    it('should cancel the move attempt when clicking on invalid target instead of selecting orientation', fakeAsync(async() => {
        // Given a state with a piece already on board, which has been selected by the player, along with a valid target
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, u],
        ];
        const state: SiamState = new SiamState(board, 0);
        await testUtils.setupState(state);
        await testUtils.expectClickSuccess('#square_4_4');
        await testUtils.expectClickSuccess('#square_4_3');

        // When the player clicks on a square instead of an orientation arrow
        spyOn(testUtils.getGameComponent(), 'cancelMoveAttempt').and.callThrough();
        await testUtils.expectClickSuccess('#square_2_2');
        // Then the move should be canceled
        expect(testUtils.getGameComponent().cancelMoveAttempt).toHaveBeenCalledOnceWith();
    }));

    it('should cancel the move when clicking on invalid target for move', fakeAsync(async() => {
        // Given a state with a piece already on board, which has been selected by the player
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, u],
        ];
        const state: SiamState = new SiamState(board, 0);
        await testUtils.setupState(state);
        await testUtils.expectClickSuccess('#square_4_4');

        // When the player clicks on a mountain
        // Then the move should be canceled and an error should be toasted
        await testUtils.expectClickFailure('#square_2_2', SiamFailure.MUST_SELECT_VALID_DESTINATION());
    }));

    it('should directly insert the piece in the desired direction when clicking on an indicator arrow', fakeAsync(async() => {
        // Given a state with a piece in a corner
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, u],
        ];
        const state: SiamState = new SiamState(board, 0);
        await testUtils.setupState(state);

        // When the player inserts a piece in the same corner by selecting an arrow
        await testUtils.expectClickSuccess('#remainingPieces_0');

        // Then the corresponding move should be done directly
        const move: SiamMove = SiamMove.of(5, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        await testUtils.expectMoveSuccess('#indicator_4_4_LEFT', move);
    }));

    function expectTranslationYToBe(elementSelector: string, y: number): void {
        const element: DebugElement = testUtils.findElement(elementSelector);
        const transform: SVGTransform = element.nativeElement.transform.baseVal.getItem(0);
        expect(transform.type).toBe(SVGTransform.SVG_TRANSFORM_TRANSLATE);
        // In a SVG transform, f is the y coordinate
        expect(transform.matrix.f).toBe(y);
    }

    it('should display current player pieces on the bottom (Player.ONE)', fakeAsync(async() => {
        // Given a state
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 1);

        // When the game is displayed from the point of view of Player.ONE
        await testUtils.setupState(state);
        testUtils.getGameComponent().setPointOfView(Player.ONE);

        // Then Player.ONE's pieces should be on the bottom
        expectTranslationYToBe('#remainingPieces_0_0', -100);
        expectTranslationYToBe('#remainingPieces_1_0', 500);
    }));

    it('should display player zero pieces on the bottom (observer)', fakeAsync(async() => {
        // Given a state
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 0);

        // When the game is displayed for an observer
        await testUtils.setupState(state);
        await testUtils.getWrapper().setRole(PlayerOrNone.NONE);

        // Then player 0's pieces should be on the bottom
        expectTranslationYToBe('#remainingPieces_0_0', 500);
        expectTranslationYToBe('#remainingPieces_1_0', -100);
    }));

});
