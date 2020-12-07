import { SiamRules } from './SiamRules';
import { SiamMove } from '../siammove/SiamMove';
import { SiamPiece } from '../siampiece/SiamPiece';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { SiamPartSlice } from '../SiamPartSlice';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { SiamLegalityStatus } from '../SiamLegalityStatus';
import { Orthogonale } from 'src/app/jscaip/DIRECTION';
import { MGPOptional } from 'src/app/collectionlib/mgpoptional/MGPOptional';

describe('SiamRules:', () => {

    let rules: SiamRules;

    const _: number = SiamPiece.EMPTY.value;
    const M: number = SiamPiece.MOUNTAIN.value;

    const U: number = SiamPiece.WHITE_UP.value;
    const L: number = SiamPiece.WHITE_LEFT.value;
    const R: number = SiamPiece.WHITE_RIGHT.value;
    const D: number = SiamPiece.WHITE_DOWN.value;

    const u: number = SiamPiece.BLACK_UP.value;
    const l: number = SiamPiece.BLACK_LEFT.value;
    const r: number = SiamPiece.BLACK_RIGHT.value;
    const d: number = SiamPiece.BLACK_DOWN.value;

    beforeAll(() => {
        SiamRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || SiamRules.VERBOSE;
    });
    beforeEach(() => {
        rules = new SiamRules(SiamPartSlice);
    });
    it('Should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, "Game should start a turn 0");
    });
    it('Should provide 44 first turn childs at turn 0', () => {
        const firstTurnMoves: MGPMap<SiamMove, SiamPartSlice> = rules.getListMoves(rules.node);
        expect(firstTurnMoves.size()).toEqual(44);
        expect(firstTurnMoves.getByIndex(0).value.turn).toEqual(1);
    });
    it('Insertion should work', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [R, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(-1, 4, MGPOptional.of(Orthogonale.RIGHT), Orthogonale.RIGHT);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTruthy("Move should be legal");
        const resultingSlice: SiamPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Simple forwarding should work', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, U, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, U, _, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(2, 4, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTruthy("Move should be legal");
        const resultingSlice: SiamPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Should forbid moving opponent pieces', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, u, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(2, 4, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeFalsy("Move should be illegal");
    });
    it('Side pushing should work', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [r, _, _, _, _],
            [U, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [r, M, M, M, _],
            [U, _, _, _, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTruthy("Move should be legal");
        const resultingSlice: SiamPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Rotation should work', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [U, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [R, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.empty(), Orthogonale.RIGHT);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTruthy("Move should be legal");
        const resultingSlice: SiamPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Half turn rotation should work', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [U, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [D, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.empty(), Orthogonale.DOWN);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTruthy("Move should be legal");
        const resultingSlice: SiamPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Rotation should work while forwarding', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [U, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [D, _, _, _, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonale.UP), Orthogonale.DOWN);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTruthy("Move should be legal");
        const resultingSlice: SiamPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Should recognize fake-rotations', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, U, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(2, 4, MGPOptional.empty(), Orthogonale.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeFalsy("Move should be illegal");
    });
    it('Moving in a direction different from the piece should be legal', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [U, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, L, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonale.RIGHT), Orthogonale.LEFT);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTruthy("Move should be legal");
        const resultingSlice: SiamPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('One vs one push should not work', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [d, _, _, _, _],
            [U, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeFalsy("Move should be illegal");
    });
    it('One vs one push should not work even if one of the involved is at the border', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [D, _, _, _, _],
            [u, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, 3, MGPOptional.of(Orthogonale.DOWN), Orthogonale.DOWN);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeFalsy("Move should be illegal");
    });
    it('Two vs one push should work', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [d, M, M, M, _],
            [U, _, _, _, _],
            [U, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _],
            [d, _, _, _, _],
            [U, M, M, M, _],
            [U, _, _, _, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTruthy("Move should be legal");
        const resultingSlice: SiamPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Two vs one should not work on this configuration', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [U, M, M, M, _],
            [d, _, _, _, _],
            [U, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeFalsy("Move should be illegal");
    });
    it('Pushing while changing direction should be impossible', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [l, _, _, _, _],
            [U, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, 4, MGPOptional.of(Orthogonale.UP), Orthogonale.LEFT);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeFalsy("Move should be illegal");
    });
    it('6 insertions should be impossible', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [U, U, U, U, U]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, -1, MGPOptional.of(Orthogonale.DOWN), Orthogonale.DOWN);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeFalsy("Move should be illegal");
    });
    it('Pushing several mountains should be illegal', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [R, M, M, _, _],
            [_, _, _, M, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, 2, MGPOptional.of(Orthogonale.RIGHT), Orthogonale.RIGHT);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeFalsy("Move should be illegal");
    });
    it('Two pusher can push two mountain', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [R, R, M, M, _],
            [_, _, _, M, _],
            [_, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, R, R, M, M],
            [_, _, _, M, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(0, 2, MGPOptional.of(Orthogonale.RIGHT), Orthogonale.RIGHT);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTruthy("Move should be legal");
        const resultingSlice: SiamPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Player 0 pushing player 0 pushing mountain should be a victory for player 0', () => {
        const board: number[][] = [
            [_, _, M, _, _],
            [_, _, U, _, _],
            [_, M, U, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, U, _, _],
            [_, _, U, _, _],
            [_, M, _, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(2, 2, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTruthy("Move should be legal");
        const resultingSlice: SiamPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(rules.getBoardValue(move, expectedSlice)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
    it('Player 1 pushing player 0 pushing mountain should be a victory for player 0', () => {
        const board: number[][] = [
            [_, _, M, _, _],
            [_, _, u, _, _],
            [_, M, U, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, u, _, _],
            [_, _, U, _, _],
            [_, M, _, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(2, 2, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTruthy("Move should be legal");
        const resultingSlice: SiamPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(rules.getBoardValue(move, expectedSlice)).toEqual(Number.MAX_SAFE_INTEGER, "This should be a victory for player 1");
    });
    it('Player 0 pushing player 1 on his side pushing mountain should be a victory for player 0', () => {
        const board: number[][] = [
            [_, _, M, _, _],
            [_, _, l, _, _],
            [_, M, R, M, _],
            [_, _, R, _, _],
            [_, _, R, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, l, _, _],
            [_, _, R, _, _],
            [_, M, R, M, _],
            [_, _, R, _, _],
            [_, _, U, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(2, 5, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
        const status: SiamLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTruthy("Move should be legal");
        const resultingSlice: SiamPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(rules.getBoardValue(move, expectedSlice)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });
});
