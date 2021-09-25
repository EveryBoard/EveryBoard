import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { DvonnBoard } from '../DvonnBoard';
import { DvonnMove } from '../DvonnMove';
import { DvonnState } from '../DvonnState';
import { DvonnPieceStack } from '../DvonnPieceStack';
import { DvonnRules } from '../DvonnRules';
import { MaxStacksDvonnMinimax } from '../MaxStacksDvonnMinimax';

describe('MaxStacksDvonnMinimax', () => {
    let rules: DvonnRules;
    let minimax: MaxStacksDvonnMinimax;

    const _: DvonnPieceStack = DvonnPieceStack.EMPTY;
    const D: DvonnPieceStack = DvonnPieceStack.SOURCE;
    // const B: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
    const BB: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 2, false);
    const W: DvonnPieceStack = DvonnPieceStack.PLAYER_ONE;
    const WW: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 2, false);

    beforeEach(() => {
        rules = new DvonnRules(DvonnState);
        minimax = new MaxStacksDvonnMinimax(rules, 'MaxStacksDvonnMinimax');
    });
    it('should propose 41 moves at first turn', () => {
        expect(minimax.getListMoves(rules.node).length).toBe(41);
    });
    it('should consider owning a new stack the best move', () => {
        // B can choose between doubling one of its stack or owning an opponent's stack
        const board: DvonnBoard = new DvonnBoard([
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, BB, D, BB, D, WW, D, W, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);

        const state: DvonnState = new DvonnState(board, 0, false);
        rules.node = new MGPNode(null, null, state);
        const bestMove: DvonnMove = rules.node.findBestMove(1, minimax);
        expect(minimax.getListMoves(rules.node).length).toBe(3); // There are three possible moves
        // The best is the one that finishes on WW
        expect(state.board[bestMove.end.y][bestMove.end.x]).toBe(DvonnPieceStack.encoder.encodeNumber(WW));
    });
    it('should prefer owning an opponent piece than a source', () => {
        // B can choose between doubling one of its stack or owning an opponent's stack
        const board: DvonnBoard = new DvonnBoard([
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, D, D, BB, D, W, D, W, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);

        const state: DvonnState = new DvonnState(board, 0, false);
        rules.node = new MGPNode(null, null, state);
        const bestMove: DvonnMove = rules.node.findBestMove(1, minimax);
        expect(minimax.getListMoves(rules.node).length).toBe(2);
        // The best move is the one that finishes on W
        expect(state.board[bestMove.end.y][bestMove.end.x]).toBe(DvonnPieceStack.encoder.encodeNumber(W));
    });
});
