/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { QuartoComponent } from '../quarto.component';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { QuartoState } from 'src/app/games/quarto/QuartoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('QuartoComponent', () => {

    let testUtils: ComponentTestUtils<QuartoComponent>;

    const NULL: QuartoPiece = QuartoPiece.EMPTY;
    const AAAA: QuartoPiece = QuartoPiece.AAAA;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<QuartoComponent>('Quarto');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    describe('First click', () => {
        it('should forbid clicking on occupied square', fakeAsync(async() => {
            // Given a board with at least one piece
            const board: Table<QuartoPiece> = [
                [AAAA, NULL, NULL, NULL],
                [NULL, NULL, NULL, NULL],
                [NULL, NULL, NULL, NULL],
                [NULL, NULL, NULL, NULL],
            ];
            const state: QuartoState = new QuartoState(board, 1, QuartoPiece.AAAB);
            await testUtils.setupState(state);
            // When clicking on an occupied square
            // Then the move should be rejected
            await testUtils.expectClickFailure('#chooseCoord_0_0', RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }));

        it('should select "piece to give" when clicking on it', fakeAsync(async() => {
            // Given any board with remaining piece
            // When clicking on a piece
            await testUtils.expectClickSuccess('#choosePiece_1');

            // Then it should be selected
            testUtils.expectElementToExist('#chosenPiece_1');
        }));

        it('should select landing coord when clicking on it', fakeAsync(async() => {
            // Given a board with remaining space
            // When clicking on one space of the board
            await testUtils.expectClickSuccess('#chooseCoord_0_0');

            // Then the space should contain the piece to put on the board
            testUtils.expectElementToExist('#droppedPiece_0_0');
        }));
    });
    describe('Second click', () => {
        it('should accept move when choosing piece then choosing coord', fakeAsync(async() => {
            // Given any state where user has clicked a piece
            await testUtils.expectClickSuccess('#choosePiece_1');

            // When clicking on a square
            // Then the move should be accepted
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAB);
            await testUtils.expectMoveSuccess('#chooseCoord_0_0', move);
        }));

        it('should accept move when choosing coord then choosing piece', fakeAsync(async() => {
            // Given any state where the user has selected a coord
            await testUtils.expectClickSuccess('#chooseCoord_0_0');

            // When clicking on a piece
            // Then the move should be accepted
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAB);
            await testUtils.expectMoveSuccess('#choosePiece_1', move);
        }));

        it('should allow to make last move', fakeAsync(async() => {
            // Given a state at the last turn
            const board: QuartoPiece[][] = [
                [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
                [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
                [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
                [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.EMPTY],
            ];
            const pieceInHand: QuartoPiece = QuartoPiece.BAAB;
            const state: QuartoState = new QuartoState(board, 15, pieceInHand);
            await testUtils.setupState(state);

            // When clicking on the last empty square
            // Then the move should be accepted
            const move: QuartoMove = new QuartoMove(3, 3, QuartoPiece.EMPTY);
            await testUtils.expectMoveSuccess('#chooseCoord_3_3', move);
        }));

        it('should deselect piece when clicking a second time on it', fakeAsync(async() => {
            // Given any board with remaining piece selected
            await testUtils.expectClickSuccess('#choosePiece_1');

            // When clicking on that piece again
            await testUtils.expectClickSuccess('#choosePiece_1');

            // Then it should no longer be selected
            testUtils.expectElementNotToExist('#chosenPiece_1');
        }));

        it('should deselect landing coord when clicking on it again', fakeAsync(async() => {
            // Given a board with remaining space and one of them already contain the droppedPiece
            await testUtils.expectClickSuccess('#chooseCoord_0_0');

            // When clicking on the dropped piece's coord again (hence, on the dropped piece)
            await testUtils.expectClickSuccess('#droppedPiece_0_0');

            // Then the space should contain the piece to put on the board
            testUtils.expectElementNotToExist('#droppedPiece_0_0');
        }));
    });

    it('should not show a piece in hand at the very last turn when all pieces are on the board', fakeAsync(async() => {
        // Given a state of a part finished at the last turn
        const board: QuartoPiece[][] = [
            [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
            [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
            [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
            [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.BAAB],
        ];
        const pieceInHand: QuartoPiece = QuartoPiece.EMPTY;
        const state: QuartoState = new QuartoState(board, 16, pieceInHand);

        // When displaying it
        await testUtils.setupState(state);
        // Then it should not show any piece in hand
        testUtils.expectElementNotToExist('#pieceInHand');
    }));
});
