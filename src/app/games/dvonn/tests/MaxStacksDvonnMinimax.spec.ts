/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { DvonnMove } from '../DvonnMove';
import { DvonnState } from '../DvonnState';
import { DvonnPieceStack } from '../DvonnPieceStack';
import { DvonnNode, DvonnRules } from '../DvonnRules';
import { DvonnOrderedMoveGenerator, MaxStacksDvonnMinimax } from '../MaxStacksDvonnMinimax';
import { Table } from 'src/app/utils/ArrayUtils';
import { AIDepthLimitOptions } from 'src/app/jscaip/MGPNode';

describe('DvonnOrderedMoveGenerator', () => {

    let rules: DvonnRules;
    let moveGenerator: DvonnOrderedMoveGenerator;

    beforeEach(() => {
        rules = DvonnRules.get();
        moveGenerator = new DvonnOrderedMoveGenerator();
    });
    it('should propose 41 moves at first turn', () => {
        const node: DvonnNode = rules.getInitialNode();
        expect(moveGenerator.getListMoves(node).length).toBe(41);
    });
});

describe('MaxStacksDvonnMinimax', () => {

    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    let minimax: MaxStacksDvonnMinimax;
    let moveGenerator: DvonnOrderedMoveGenerator;

    const _: DvonnPieceStack = DvonnPieceStack.EMPTY;
    const D: DvonnPieceStack = DvonnPieceStack.SOURCE;
    const BB: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 2, false);
    const W: DvonnPieceStack = DvonnPieceStack.PLAYER_ONE;
    const WW: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 2, false);

    beforeEach(() => {
        minimax = new MaxStacksDvonnMinimax();
        moveGenerator = new DvonnOrderedMoveGenerator();
    });
    it('should consider owning a new stack the best move', () => {
        // B can choose between doubling one of its stack or owning an opponent's stack
        const board: Table<DvonnPieceStack> = [
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, BB, D, BB, D, WW, D, W, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];

        const state: DvonnState = new DvonnState(board, 0, false);
        const node: DvonnNode = new DvonnNode(state);
        const bestMove: DvonnMove = minimax.chooseNextMove(node, minimaxOptions);
        expect(moveGenerator.getListMoves(node).length).toBe(3); // There are three possible moves
        // The best is the one that finishes on WW
        expect(state.getPieceAt(bestMove.getEnd())).toBe(WW);
    });
    it('should prefer owning an opponent piece than a source', () => {
        // B can choose between doubling one of its stack or owning an opponent's stack
        const board: Table<DvonnPieceStack> = [
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, D, D, BB, D, W, D, W, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ];

        const state: DvonnState = new DvonnState(board, 0, false);
        const node: DvonnNode = new DvonnNode(state);
        const bestMove: DvonnMove = minimax.chooseNextMove(node, minimaxOptions);
        expect(moveGenerator.getListMoves(node).length).toBe(2);
        // The best move is the one that finishes on W
        const bestMoveEnd: DvonnPieceStack = state.getPieceAt(bestMove.getEnd());
        expect(bestMoveEnd).toBe(W);
    });
});
