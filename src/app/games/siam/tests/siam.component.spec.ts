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

describe('SiamComponent', () => {

    let testUtils: ComponentTestUtils<SiamComponent>;

    const _: SiamPiece = SiamPiece.EMPTY;
    const M: SiamPiece = SiamPiece.MOUNTAIN;
    const U: SiamPiece = SiamPiece.LIGHT_UP;
    const u: SiamPiece = SiamPiece.DARK_UP;

    async function expectMoveLegality(move: SiamMove): Promise<void> {
        if (move.isInsertion()) {
            await testUtils.expectClickSuccess('#insertAt_' + move.coord.x + '_' + move.coord.y);
            const orientation: string = move.landingOrientation.toString();
            return testUtils.expectMoveSuccess('#chooseOrientation_' + orientation, move);
        } else {
            await testUtils.expectClickSuccess('#clickPiece_' + move.coord.x + '_' + move.coord.y);
            const direction: MGPOptional<Orthogonal> = move.moveDirection;
            const moveDirection: string = direction.isPresent() ? direction.get().toString() : '';
            await testUtils.expectClickSuccess('#chooseDirection_' + moveDirection);
            const landingOrientation: string = move.landingOrientation.toString();
            return testUtils.expectMoveSuccess('#chooseOrientation_' + landingOrientation, move);
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
        await testUtils.expectClickSuccess('#insertAt_2_-1');
        const move: SiamMove = new SiamMove(2, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN);
        // Then it should succeed
        await testUtils.expectMoveSuccess('#chooseOrientation_DOWN', move);
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
        await testUtils.expectClickFailure('#clickPiece_4_4', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    }));
    it('should cancel move when trying to insert while having selected a piece', fakeAsync(async() => {
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
        const move: SiamMove = new SiamMove(0, 0, MGPOptional.empty(), Orthogonal.DOWN);
        await expectMoveLegality(move);
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
        const move: SiamMove = new SiamMove(4, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        await expectMoveLegality(move);
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
        const move: SiamMove = new SiamMove(5, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        await expectMoveLegality(move);

        // Then the moved piece and departed square should be highlighted
        testUtils.expectElementToHaveClasses('#insertAt_4_4', ['base', 'moved-fill']);
        testUtils.expectElementToHaveClasses('#insertAt_3_4', ['base', 'moved-fill']);
        testUtils.expectElementToHaveClasses('#insertAt_2_4', ['base']);
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
        await testUtils.expectClickSuccess('#clickPiece_4_4');
        const move: SiamMove = new SiamMove(4, 4, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN);
        await testUtils.expectMoveSuccess('#chooseDirection_DOWN', move);
    }));
    it('should toast when clicking as first click on an empty square', fakeAsync(async() => {
        // Given the initial board
        // When clicking on an empty piece
        // Then a toast should say it's forbidden
        const reason: string = SiamFailure.MUST_INSERT_OR_CHOOSE_YOUR_PIECE();
        await testUtils.expectClickFailure('#insertAt_2_1', reason);
    }));
});
