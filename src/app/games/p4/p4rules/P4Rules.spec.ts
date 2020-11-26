import {P4Rules} from './P4Rules';
import {MoveX} from '../../../jscaip/MoveX';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { Player } from 'src/app/jscaip/Player';
import { P4PartSlice } from '../P4PartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MNode } from 'src/app/jscaip/MNode';

describe('P4Rules', () => {

    let rules: P4Rules;
    let O: number = Player.ZERO.value;
    let X: number = Player.ONE.value;
    let _: number = Player.NONE.value;

    beforeAll(() => {
        P4Rules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || P4Rules.VERBOSE;
    });
    beforeEach(() => {
        rules = new P4Rules();
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.getBoardValue(rules.node.move, rules.node.gamePartSlice)).toEqual(0);
    });
    it('Should drop piece on the lowest case of the column', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const slice: P4PartSlice = new P4PartSlice(board, 0);
        const move: MoveX = MoveX.get(3);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeTruthy();
        const resultingSlice: P4PartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        expect(resultingSlice.board).toEqual(expectedBoard);
    });
    it('First player should win vertically', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const slice: P4PartSlice = new P4PartSlice(board, 0);
        rules.node = new MNode(null, null, slice, 0);
        const move: MoveX = MoveX.get(3);
        expect(rules.choose(move)).toBeTruthy("Move should be legal");
        expect(rules.node.gamePartSlice.board).toEqual(expectedBoard);
        expect(rules.node.ownValue).toEqual(Number.MIN_SAFE_INTEGER);
        expect(rules.node.isEndGame()).toBeTruthy("Game should be over");
    });
    it('Second player should win vertically', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const slice: P4PartSlice = new P4PartSlice(board, 1);
        rules.node = new MNode(null, null, slice, 0);
        const move: MoveX = MoveX.get(3);
        expect(rules.choose(move)).toBeTruthy("Move should be legal");
        expect(rules.node.gamePartSlice.board).toEqual(expectedBoard);
        expect(rules.node.ownValue).toEqual(Number.MAX_SAFE_INTEGER);
        expect(rules.node.isEndGame()).toBeTruthy("Game should be over");
    });
    it('Should be a draw', () => {
        const board: number[][] = [
            [O, O, O, _, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
        ];
        const expectedBoard: number[][] = [
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
        ];
        const slice: P4PartSlice = new P4PartSlice(board, 41);
        rules.node = new MNode(null, null, slice, 0);
        const move: MoveX = MoveX.get(3);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeTruthy();
        const resultingSlice: P4PartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        expect(resultingSlice.board).toEqual(expectedBoard);
        expect(rules.getBoardValue(move, resultingSlice)).toEqual(0);
        expect(rules.node.isEndGame()).toBeTruthy();
    });
});