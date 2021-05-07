import { QuartoComponent } from '../quarto.component';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { QuartoPartSlice } from 'src/app/games/quarto/QuartoPartSlice';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';

describe('QuartoComponent', () => {
    let componentTestUtils: ComponentTestUtils<QuartoComponent>;

    const NULL: number = QuartoPiece.NONE.value;
    const AAAA: number = QuartoPiece.AAAA.value;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<QuartoComponent>('Quarto');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('should forbid clicking on occupied case', fakeAsync(async() => {
        const board: number[][] = [
            [AAAA, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
        ];
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 1, QuartoPiece.AAAB);
        componentTestUtils.setupSlice(slice);
        await componentTestUtils.expectClickFailure('#chooseCoord_0_0', 'Choisissez une case vide.');
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
        const board: number[][] = ArrayUtils.mapBiArray([
            [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
            [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
            [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
            [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.NONE],
        ], QuartoPiece.toInt);
        const pieceInHand: QuartoPiece = QuartoPiece.BAAB;
        const initialSlice: QuartoPartSlice = new QuartoPartSlice(board, 15, pieceInHand);
        componentTestUtils.setupSlice(initialSlice);

        const move: QuartoMove = new QuartoMove(3, 3, QuartoPiece.NONE);
        await componentTestUtils.expectMoveSuccess('#chooseCoord_3_3', move);
    }));
    it('should delegate decoding to move', () => {
        spyOn(QuartoMove, 'decode').and.callThrough();
        componentTestUtils.getComponent().decodeMove(5);
        expect(QuartoMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(QuartoMove, 'encode').and.callThrough();
        componentTestUtils.getComponent().encodeMove(new QuartoMove(2, 2, QuartoPiece.AABA));
        expect(QuartoMove.encode).toHaveBeenCalledTimes(1);
    });
});
