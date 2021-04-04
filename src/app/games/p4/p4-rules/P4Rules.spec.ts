import { P4Node, P4Rules } from './P4Rules';
import { Player } from 'src/app/jscaip/player/Player';
import { P4PartSlice } from '../P4PartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { P4Move } from '../P4Move';

describe('P4Rules', () => {
    let rules: P4Rules;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;
    const _: number = Player.NONE.value;

    beforeEach(() => {
        rules = new P4Rules(P4PartSlice);
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
        const move: P4Move = P4Move.of(3);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
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
        rules.node = new MGPNode(null, null, slice, 0);
        const move: P4Move = P4Move.of(3);
        expect(rules.choose(move)).toBeTrue();
        expect(rules.node.gamePartSlice.board).toEqual(expectedBoard);
        expect(rules.node.ownValue).toEqual(Number.MIN_SAFE_INTEGER);
        expect(rules.node.isEndGame()).toBeTrue();
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
        rules.node = new MGPNode(null, null, slice, 0);
        const move: P4Move = P4Move.of(3);
        expect(rules.choose(move)).toBeTrue();
        expect(rules.node.gamePartSlice.board).toEqual(expectedBoard);
        expect(rules.node.ownValue).toEqual(Number.MAX_SAFE_INTEGER);
        expect(rules.node.isEndGame()).toBeTrue();
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
        rules.node = new MGPNode(null, null, slice, 0);
        const move: P4Move = P4Move.of(3);
        expect(rules.choose(move)).toBeTrue();
        const resultingSlice: P4PartSlice = rules.node.gamePartSlice;
        expect(resultingSlice.board).toEqual(expectedBoard);
        expect(rules.node.isEndGame()).toBeTrue();
        expect(rules.node.ownValue).toBe(0);
    });
    it('Should know when a column is full or not', () => {
        const board: number[][] = [
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, O, X, O, X, O, X],
        ];
        const slice: P4PartSlice = new P4PartSlice(board, 12);
        const node: P4Node = new MGPNode(null, null, slice, 0);
        expect(rules.getListMoves(node).size()).toBe(6);
    });
    it('should forbid placing a piece on a full column', () => {
        const board: number[][] = [
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, O, X, O, X, O, X],
        ];
        const slice: P4PartSlice = new P4PartSlice(board, 12);
        const move: P4Move = P4Move.of(0);
        expect(rules.isLegal(move, slice).legal.isFailure()).toBeTrue();
    });
    it('should assign greater score to center column', () => {
        const board1: number[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const slice1: P4PartSlice = new P4PartSlice(board1, 12);
        const board2: number[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, O],
        ];
        const slice2: P4PartSlice = new P4PartSlice(board2, 12);

        expect(P4Rules.getBoardValue(slice1)).toBeLessThan(P4Rules.getBoardValue(slice2));
    });
});
