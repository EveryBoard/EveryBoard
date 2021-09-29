import { fakeAsync } from '@angular/core/testing';
import { QuartoComponent } from '../quarto.component';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { QuartoState } from 'src/app/games/quarto/QuartoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('QuartoComponent', () => {

    let componentTestUtils: ComponentTestUtils<QuartoComponent>;

    const NULL: QuartoPiece = QuartoPiece.NONE;
    const AAAA: QuartoPiece = QuartoPiece.AAAA;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<QuartoComponent>('Quarto');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('should forbid clicking on occupied case', fakeAsync(async() => {
        const board: Table<QuartoPiece> = [
            [AAAA, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
        ];
        const state: QuartoState = new QuartoState(board, 1, QuartoPiece.AAAB);
        componentTestUtils.setupState(state);
        await componentTestUtils.expectClickFailure('#chooseCoord_0_0', RulesFailure.MUST_CLICK_ON_EMPTY_SPACE);
    }));
    it('should accept move when choosing piece then choosing coord', fakeAsync(async() => {
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAB);

        await componentTestUtils.expectClickSuccess('#choosePiece_1');
        await componentTestUtils.expectMoveSuccess('#chooseCoord_0_0', move);
    }));
    it('should accept move when choosing coord then choosing piece', fakeAsync(async() => {
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAB);

        await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');
        await componentTestUtils.expectMoveSuccess('#choosePiece_1', move);
    }));
    it('should allow to make last move', fakeAsync(async() => {
        const board: QuartoPiece[][] = [
            [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
            [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
            [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
            [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.NONE],
        ];
        const pieceInHand: QuartoPiece = QuartoPiece.BAAB;
        const initialState: QuartoState = new QuartoState(board, 15, pieceInHand);
        componentTestUtils.setupState(initialState);

        const move: QuartoMove = new QuartoMove(3, 3, QuartoPiece.NONE);
        await componentTestUtils.expectMoveSuccess('#chooseCoord_3_3', move);
    }));
});
