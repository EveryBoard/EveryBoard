import { QuartoRules } from '../QuartoRules';
import { QuartoMove } from '../QuartoMove';
import { QuartoPiece } from '../QuartoPiece';
import { QuartoPartSlice } from '../QuartoPartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { ArrayUtils } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';

describe('QuartoRules', () => {
    let rules: QuartoRules;

    beforeEach(() => {
        rules = new QuartoRules(QuartoPartSlice);
    });
    it('Should create', () => {
        expect(rules).toBeTruthy();
    });
    it('Should forbid not to give a piece when not last turn', () => {
        const slice: QuartoPartSlice = QuartoPartSlice.getInitialSlice();
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.NONE);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.getReason()).toBe('You must give a piece.');
    });
    it('Should allow not to give a piece when last turn, and consider the game a draw if no one win', () => {
        const board: number[][] = ArrayUtils.mapBiArray([
            [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
            [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
            [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
            [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.NONE],
        ], QuartoPiece.toInt);
        const expectedBoard: number[][] = ArrayUtils.mapBiArray([
            [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
            [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
            [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
            [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.BAAB],
        ], QuartoPiece.toInt);
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 15, QuartoPiece.BAAB);
        rules.node = new MGPNode(null, null, slice, 0);
        const move: QuartoMove = new QuartoMove(3, 3, QuartoPiece.NONE);
        const possiblesMoves: MGPMap<QuartoMove, QuartoPartSlice> = rules.getListMoves(rules.node);
        expect(possiblesMoves.size()).toBe(1);
        expect(possiblesMoves.getByIndex(0).key).toEqual(move);
        expect(rules.choose(move)).toBeTrue();
        const resultingSlice: QuartoPartSlice = rules.node.gamePartSlice;
        const expectedSlice: QuartoPartSlice = new QuartoPartSlice(expectedBoard, 16, QuartoPiece.NONE);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(rules.getBoardValue(move, expectedSlice)).toEqual(0, 'This should be a draw.');
        expect(rules.node.isEndGame()).toBeTrue();
    });
    it('Should forbid to give a piece already on the board', () => {
        const board: number[][] = [
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [0, 16, 16, 16],
        ];
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 1, QuartoPiece.AABA);
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAA);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.getReason()).toBe('That piece is already on the board.');
    });
    it('Should forbid to give the piece that you had in your hand', () => {
        const slice: QuartoPartSlice = QuartoPartSlice.getInitialSlice();
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAA);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.getReason()).toBe('You cannot give the piece that was in your hands.');
    });
    it('Should forbid to play on occupied case', () => {
        const board: number[][] = [
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [0, 16, 16, 16],
        ];
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 1, QuartoPiece.AABA);
        const move: QuartoMove = new QuartoMove(0, 3, QuartoPiece.BBAA);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.getReason()).toBe('Cannot play on an occupied case.');
    });
    it('Should allow simple move', () => {
        const move: QuartoMove = new QuartoMove(2, 2, QuartoPiece.AAAB);
        const isLegal: boolean = rules.choose(move);
        expect(isLegal).toBeTrue();
    });
    it('Should considered player 0 winner when doing a full line', () => {
        const board: number[][] = [
            [15, 14, 13, 16],
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [0, 16, 16, 16],
        ];
        const expectedBoard: number[][] = [
            [15, 14, 13, 12],
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [0, 16, 16, 16],
        ];
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 4, QuartoPiece.BBAA);
        const move: QuartoMove = new QuartoMove(3, 0, QuartoPiece.AAAB);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: QuartoPartSlice = rules.applyLegalMove(move, slice);
        const expectedSlice: QuartoPartSlice = new QuartoPartSlice(expectedBoard, 5, QuartoPiece.AAAB);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = rules.getBoardValue(move, expectedSlice);
        expect(boardValue).toEqual(Number.MIN_SAFE_INTEGER, 'This should be a victory for player 0.');
    });
    it('Should considered player 1 winner when doing a full line', () => {
        const board: number[][] = [
            [5, 16, 3, 16],
            [16, 1, 11, 16],
            [16, 0, 12, 14],
            [7, 16, 9, 16],
        ];
        const expectedBoard: number[][] = [
            [5, 16, 3, 16],
            [16, 1, 11, 16],
            [16, 0, 12, 14],
            [7, 16, 9, 13],
        ];
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 9, QuartoPiece.BBAB);
        const move: QuartoMove = new QuartoMove(3, 3, QuartoPiece.AABA);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: QuartoPartSlice = rules.applyLegalMove(move, slice);
        const expectedSlice: QuartoPartSlice = new QuartoPartSlice(expectedBoard, 10, QuartoPiece.AABA);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = rules.getBoardValue(move, expectedSlice);
        expect(boardValue).toEqual(Number.MAX_SAFE_INTEGER, 'This should be a victory for player 1.');
    });
});
