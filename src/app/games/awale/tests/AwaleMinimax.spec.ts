/* eslint-disable max-lines-per-function */
import { AwaleNode, AwaleRules } from '../AwaleRules';
import { AwaleMinimax } from '../AwaleMinimax';
import { AwaleMove } from '../AwaleMove';
import { AwaleState } from '../AwaleState';
import { Table } from 'src/app/utils/ArrayUtils';

describe('AwaleMinimax:', () => {

    let rules: AwaleRules;

    let minimax: AwaleMinimax;

    beforeEach(() => {
        rules = new AwaleRules(AwaleState);
        minimax = new AwaleMinimax(rules, 'AwaleMinimax');
    });
    it('should not throw at first choice', () => {
        const bestMove: AwaleMove = rules.node.findBestMove(2, minimax);
        expect(rules.isLegal(bestMove, rules.node.gameState).isSuccess()).toBeTrue();
    });
    it('should choose capture when possible (at depth 1)', () => {
        // Given a state with a possible capture
        const board: Table<number> = [
            [4, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 1],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        const node: AwaleNode = new AwaleNode(state);
        // When getting the best move
        const bestMove: AwaleMove = node.findBestMove(1, minimax);
        // Then the best move should be the capture
        expect(bestMove).toEqual(AwaleMove.TWO);
    });
    it('should choose capture when possible (at depth 2)', () => {
        // Given a state with a possible capture
        const board: Table<number> = [
            [0, 0, 0, 0, 3, 1],
            [0, 0, 0, 0, 1, 0],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        const node: AwaleNode = new AwaleNode(state);
        // When getting the best move
        const bestMove: AwaleMove = node.findBestMove(2, minimax);
        // Then the best move should be the capture
        expect(bestMove).toEqual(AwaleMove.FOUR);
    });
    it('should not try to perform illegal moves', () => {
        // Given a state with an illegal distribution due to the do-not-starve rule
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        const node: AwaleNode = new AwaleNode(state);
        // When listing the moves
        const moves: AwaleMove[] = minimax.getListMoves(node);
        // Then only the legal moves should be present
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(AwaleMove.FIVE);
    });
    it('should prioritise moves in the same territory when no captures are possible', () => {
        // Given a state with only one move that distributes only in the player's territory
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 7],
            [0, 1, 0, 0, 0, 0],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        const node: AwaleNode = new AwaleNode(state);
        // When getting the best move
        const bestMove: AwaleMove = node.findBestMove(1, minimax);
        // Then the best move should be the capture
        expect(bestMove).toEqual(AwaleMove.ZERO);
    });
});

