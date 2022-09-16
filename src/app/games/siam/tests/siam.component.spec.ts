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
import { SiamFailure } from '../SiamFailure';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';

fdescribe('SiamComponent', () => {

    let testUtils: ComponentTestUtils<SiamComponent>;

    const _: SiamPiece = SiamPiece.EMPTY;
    const M: SiamPiece = SiamPiece.MOUNTAIN;
    const U: SiamPiece = SiamPiece.LIGHT_UP;
    const u: SiamPiece = SiamPiece.DARK_UP;

    async function expectMoveLegality(player: Player, move: SiamMove): Promise<void> {
        if (move.isInsertion()) {
            await testUtils.expectClickSuccess('#selectPiece_' + player.value + '_0');
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
        await testUtils.expectClickSuccess('#selectPiece_0_0');
        await testUtils.expectClickSuccess('#square_2_0');
        const move: SiamMove = SiamMove.of(2, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN).get();
        // Then it should succeed
        await testUtils.expectMoveSuccess('#orientation_DOWN', move);
    }));
    it('should forbid to select opponent pieces', fakeAsync(async() => {
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
    xit('should cancel move when trying to insert while having selected a piece', fakeAsync(async() => {
        // Given a state and a selected piece
        const board: Table<SiamPiece> = [
            [U, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        testUtils.setupState(state);

        await testUtils.expectClickSuccess('#clickPiece_0_0');

        // When trying to insert a piece
        // Then it should fail
        await testUtils.expectClickFailure('#insertAt_-1_2', SiamFailure.CANNOT_INSERT_WHEN_SELECTED());
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
        const move: SiamMove = SiamMove.of(0, 0, MGPOptional.empty(), Orthogonal.DOWN).get();
        await expectMoveLegality(Player.ZERO, move);
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
        const move: SiamMove = SiamMove.of(4, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT).get();
        await expectMoveLegality(Player.ZERO, move);
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
        const move: SiamMove = SiamMove.of(5, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT).get();
        await expectMoveLegality(Player.ZERO, move);

        // Then the moved piece and departed square should be highlighted
        testUtils.expectElementToHaveClasses('#square_4_4', ['base', 'moved']);
        testUtils.expectElementToHaveClasses('#square_3_4', ['base', 'moved']);
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
        // The the orientation of the piece does not have to be chosen
        await testUtils.expectClickSuccess('#square_4_4');
        const move: SiamMove = SiamMove.of(4, 4, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN).get();
        await testUtils.expectMoveSuccess('#square_4_5', move);
    }));
    it('should toast when clicking as first click on an empty square', fakeAsync(async() => {
        // Given the initial board
        // When clicking on an empty piece
        // Then a toast should say it's forbidden
        const reason: string = RulesFailure.MUST_CHOOSE_PLAYER_PIECE();
        await testUtils.expectClickFailure('#square_2_1', reason);
    }));
});
