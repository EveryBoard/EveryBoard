/* eslint-disable max-lines-per-function */
import { SiamComponent } from '../siam.component';
import { SiamMove } from 'src/app/games/siam/SiamMove';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { SiamPiece } from 'src/app/games/siam/SiamPiece';
import { Table } from 'src/app/utils/ArrayUtils';
import { SiamState } from 'src/app/games/siam/SiamState';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { SiamFailure } from '../SiamFailure';

describe('SiamComponent', () => {

    let testUtils: ComponentTestUtils<SiamComponent>;

    const _: SiamPiece = SiamPiece.EMPTY;
    const M: SiamPiece = SiamPiece.MOUNTAIN;
    const U: SiamPiece = SiamPiece.LIGHT_UP;
    const u: SiamPiece = SiamPiece.DARK_UP;

    async function expectMoveToBeLegal(player: Player, move: SiamMove): Promise<void> {
        if (move.isInsertion()) {
            await testUtils.expectClickSuccess('#remainingPieces_' + player.value);
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
        const move: SiamMove = SiamMove.from(2, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN).get();
        // Then it should succeed
        await testUtils.expectMoveSuccess('#orientation_DOWN', move);
    }));
    it('should forbid to select opponent pieces for insertion', fakeAsync(async() => {
        // Given the initial state
        // When trying to select an opponent's piece for insertion
        // Then it should fail
        await testUtils.expectClickFailure('#remainingPieces_1', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
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
            [_, _, _, _, u],
        ];
        const state: SiamState = new SiamState(board, 0);
        testUtils.setupState(state);

        // When trying to select the opponent's piece
        // Then it should fail
        await testUtils.expectClickFailure('#square_4_4', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    }));
    it('should allow rotation', fakeAsync(async() => {
        // Given a state with one piece
        const board: Table<SiamPiece> = [
            [U, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        testUtils.setupState(state);

        // When performing a rotation
        // Then it should succeed
        const move: SiamMove = SiamMove.from(0, 0, MGPOptional.empty(), Orthogonal.DOWN).get();
        await expectMoveToBeLegal(Player.ZERO, move);
    }));
    it('should allow normal move', fakeAsync(async() => {
        // Given a state with a piece
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 0);
        testUtils.setupState(state);

        // When moving forward
        // Then it should succeed
        const move: SiamMove = SiamMove.from(4, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT).get();
        await expectMoveToBeLegal(Player.ZERO, move);
    }));
    it('should highlight all moved pieces upon move', fakeAsync(async() => {
        // Given a state with a piece
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 0);
        testUtils.setupState(state);

        // When performing a move
        const move: SiamMove = SiamMove.from(5, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT).get();
        await expectMoveToBeLegal(Player.ZERO, move);

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
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 0);
        testUtils.setupState(state);

        // When making the piece exit the board
        // Then the orientation of the piece does not have to be chosen
        await testUtils.expectClickSuccess('#square_4_4');
        const move: SiamMove = SiamMove.from(4, 4, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN).get();
        await testUtils.expectMoveSuccess('#square_4_5', move);
    }));
    it('should toast when clicking as first click on an empty square', fakeAsync(async() => {
        // Given the initial board
        // When clicking on an empty piece
        // Then a toast should say it's forbidden
        const reason: string = RulesFailure.MUST_CHOOSE_PLAYER_PIECE();
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
            [_, _, _, U, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        testUtils.setupState(state);
        await testUtils.expectClickSuccess('#remainingPieces_0');

        // When the player clicks on the piece on the board
        await testUtils.expectClickSuccess('#square_3_3');

        // Then a new move should be in creation and the player can finish the move
        await testUtils.expectClickSuccess('#square_3_4');
        const move: SiamMove = SiamMove.from(3, 3, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN).get();
        await testUtils.expectMoveSuccess('#orientation_DOWN', move);
    }));
    it('should cancel the move attempt when clicking on invalid target instead of selecting orientation', fakeAsync(async() => {
        // Given a state with a piece already on board, which has been selected by the player, along with a valid target
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 0);
        testUtils.setupState(state);
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
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 0);
        testUtils.setupState(state);
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
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 0);
        testUtils.setupState(state);

        // When the player inserts a piece in the same corner by selecting an arrow
        await testUtils.expectClickSuccess('#remainingPieces_0');

        // Then the corresponding move should be done directly
        const move: SiamMove = SiamMove.from(5, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT).get();
        await testUtils.expectMoveSuccess('#indicator_4_4_LEFT', move);
    }));

    function expectTranslationYToBe(transform: SVGTransform, y: number): void {
        expect(transform.type).toBe(SVGTransform.SVG_TRANSFORM_TRANSLATE);
        // In a SVG transform, f is the y coordinate
        expect(transform.matrix.f).toBe(y);
    }
    it('should display current player pieces on the bottom (Player.ONE)', () => {
        // Given a state from the point of view of player 1
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 1);

        // When the game is displayed
        testUtils.setupState(state);

        // Then player 1's pieces should be on the bottom
        const playerOneRemainingPiecesTranslation: SVGTransform =
            testUtils.findElement('#remainingPieces_1_0').nativeElement.transform.baseVal.getItem(0);
        const playerZeroRemainingPiecesTranslation: SVGTransform =
            testUtils.findElement('#remainingPieces_0_0').nativeElement.transform.baseVal.getItem(0);
        expectTranslationYToBe(playerZeroRemainingPiecesTranslation, -100);
        expectTranslationYToBe(playerOneRemainingPiecesTranslation, 700);
    });
    it('should display current player pieces on the bottom (observer)', () => {
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
        testUtils.setupState(state);
        testUtils.getWrapper().setRole(PlayerOrNone.NONE);

        // Then player 0's pieces should be on the bottom
        const playerOneRemainingPiecesTranslation: SVGTransform =
            testUtils.findElement('#remainingPieces_1_0').nativeElement.transform.baseVal.getItem(0);
        const playerZeroRemainingPiecesTranslation: SVGTransform =
            testUtils.findElement('#remainingPieces_0_0').nativeElement.transform.baseVal.getItem(0);
        expectTranslationYToBe(playerZeroRemainingPiecesTranslation, 700)
        expectTranslationYToBe(playerOneRemainingPiecesTranslation, -100)
    });
});
