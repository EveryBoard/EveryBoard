/* eslint-disable max-lines-per-function */
import { AwaleNode, AwaleRules } from '../AwaleRules';
import { AwaleMinimax } from '../AwaleMinimax';
import { AwaleMove } from '../AwaleMove';
import { MancalaState } from 'src/app/games/mancala/commons/MancalaState';
import { Table } from 'src/app/utils/ArrayUtils';

describe('AwaleMinimax', () => {

    let rules: AwaleRules;

    let minimax: AwaleMinimax;

    beforeEach(() => {
        rules = AwaleRules.get();
        minimax = new AwaleMinimax();
    });
    it('should not throw at first choice', () => {
        const node: AwaleNode = rules.getInitialNode(AwaleRules.DEFAULT_CONFIG);
        const bestMove: AwaleMove = node.findBestMove(2, minimax);
        expect(rules.isLegal(bestMove, MancalaState.getInitialState(AwaleRules.DEFAULT_CONFIG)).isSuccess()).toBeTrue();
    });
    it('should choose capture when possible (at depth 1)', () => {
        // Given a state with a possible capture
        const board: Table<number> = [
            [4, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 1],
        ];
        const state: MancalaState = new MancalaState(board, 1, [0, 0], 4);
        const node: AwaleNode = new AwaleNode(state);
        // When getting the best move
        const bestMove: AwaleMove = node.findBestMove(1, minimax);
        // Then the best move should be the capture
        expect(bestMove).toEqual(AwaleMove.of(2));
    });
    it('should choose capture when possible (at depth 2)', () => {
        // Given a state with a possible capture
        const board: Table<number> = [
            [0, 0, 0, 0, 3, 1],
            [0, 0, 0, 0, 1, 0],
        ];
        const state: MancalaState = new MancalaState(board, 1, [0, 0], 4);
        const node: AwaleNode = new AwaleNode(state);
        // When getting the best move
        const bestMove: AwaleMove = node.findBestMove(2, minimax);
        // Then the best move should be the capture
        expect(bestMove).toEqual(AwaleMove.of(4));
    });
    it('should not try to perform illegal moves', () => {
        // Given a state with an illegal distribution due to the do-not-starve rule
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: MancalaState = new MancalaState(board, 1, [0, 0], 4);
        const node: AwaleNode = new AwaleNode(state);
        // When listing the moves
        const moves: AwaleMove[] = minimax.getListMoves(node);
        // Then only the legal moves should be present
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(AwaleMove.of(5));
    });
    it('should prioritise moves in the same territory when no captures are possible', () => {
        // Given a state with only one move that distributes only in the player's territory
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 7],
            [0, 1, 0, 0, 0, 0],
        ];
        const state: MancalaState = new MancalaState(board, 1, [0, 0], 4);
        const node: AwaleNode = new AwaleNode(state);
        // When getting the best move
        const bestMove: AwaleMove = node.findBestMove(1, minimax);
        // Then the best move should be the capture
        expect(bestMove).toEqual(AwaleMove.of(0));
    });
});

