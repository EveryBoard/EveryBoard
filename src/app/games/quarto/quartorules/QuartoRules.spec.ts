import { QuartoRules } from './QuartoRules';
import { QuartoMove } from '../quartomove/QuartoMove';
import { QuartoEnum } from '../QuartoEnum';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { QuartoPartSlice } from '../QuartoPartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/mgpnode/MGPNode';

describe('QuartoRules', () => {
    let rules: QuartoRules;

    beforeAll(() => {
        QuartoRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || QuartoRules.VERBOSE;
    });
    beforeEach(() => {
        rules = new QuartoRules(QuartoPartSlice);
    });
    it('Should create', () => {
        expect(rules).toBeTruthy();
    });
    it('Should forbid not to give a piece when not last turn', () => {
        const slice: QuartoPartSlice = QuartoPartSlice.getInitialSlice();
        const move: QuartoMove = new QuartoMove(0, 0, null);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.getReason()).toBe('You must give a piece.');
    });
    it('Should allow not to give a piece when last turn, and consider the game a draw if no one win', () => {
        const board: number[][] = [
            [0, 1, 2, 12],
            [4, 5, 6, 8+0+2+1 ],
            [8, 9, 8+0+2+0, 0+4+2+1 ],
            [0+0+2+1,  8+4+2+0,  0+1, 16 ]
        ];
        const expectedBoard: number[][] = [
            [0, 1, 2, 12],
            [4, 5, 6, 8+0+2+1 ],
            [8, 9, 10, 0+4+2+1 ],
            [3,  8+4+2+0,  0+1, 15 ]
        ];
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 15, QuartoEnum.BBBB);
        rules.node = new MGPNode(null, null, slice, 0)
        const move: QuartoMove = new QuartoMove(3, 3, null);
        expect(rules.choose(move)).toBeTrue();
        const resultingSlice: QuartoPartSlice = rules.node.gamePartSlice;
        const expectedSlice: QuartoPartSlice = new QuartoPartSlice(expectedBoard, 16, null);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(rules.getBoardValue(move, expectedSlice)).toEqual(0, 'This should be a draw.');
        expect(rules.node.isEndGame()).toBeTrue();
    });
    it('Should forbid to give a piece already on the board', () => {
        const board: number[][] = [
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [0, 16, 16, 16]
        ];
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 1, QuartoEnum.AABA);
        const move: QuartoMove = new QuartoMove(0, 0, QuartoEnum.AAAA);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.getReason()).toBe('That piece is already on the board.');
    });
    it('Should forbid to give the piece that you had in your hand', () => {
        const slice: QuartoPartSlice = QuartoPartSlice.getInitialSlice();
        const move: QuartoMove = new QuartoMove(0, 0, QuartoEnum.AAAA);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.getReason()).toBe('You cannot give the piece that was in your hands.');
    });
    it('Should forbid to play on occupied case', () => {
        const board: number[][] = [
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [0, 16, 16, 16]
        ];
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 1, QuartoEnum.AABA);
        const move: QuartoMove = new QuartoMove(0, 3, QuartoEnum.BBAA);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.getReason()).toBe('Cannot play on an occupied case.');
    });
    it('Should allow simple move', () => {
        const move: QuartoMove = new QuartoMove(2, 2, QuartoEnum.AAAB);
        const isLegal: boolean = rules.choose(move);
        expect(isLegal).toBeTrue();
    });
    it('Should considered player 0 winner when doing a full line', () => {
        const board: number[][] = [
            [15, 14, 13, 16],
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [0, 16, 16, 16]
        ];
        const expectedBoard: number[][] = [
            [15, 14, 13, 12],
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [0, 16, 16, 16]
        ];
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 4, QuartoEnum.BBAA);
        const move: QuartoMove = new QuartoMove(3, 0, QuartoEnum.AAAB);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: QuartoPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: QuartoPartSlice = new QuartoPartSlice(expectedBoard, 5, QuartoEnum.AAAB);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(rules.getBoardValue(move, expectedSlice)).toEqual(Number.MIN_SAFE_INTEGER, 'This should be a victory for player 0.');
    });
    it('Should considered player 1 winner when doing a full line', () => {
        const board: number[][] = [
            [5, 16, 3, 16],
            [16, 1, 11, 16],
            [16, 0, 12, 14],
            [7, 16, 9, 16]
        ];
        const expectedBoard: number[][] = [
            [5, 16, 3, 16],
            [16, 1, 11, 16],
            [16, 0, 12, 14],
            [7, 16, 9, 13]
        ];
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 9, QuartoEnum.BBAB);
        const move: QuartoMove = new QuartoMove(3, 3, QuartoEnum.AABA);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: QuartoPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: QuartoPartSlice = new QuartoPartSlice(expectedBoard, 10, QuartoEnum.AABA);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(rules.getBoardValue(move, expectedSlice)).toEqual(Number.MAX_SAFE_INTEGER, 'This should be a victory for player 1.');
    });
});
