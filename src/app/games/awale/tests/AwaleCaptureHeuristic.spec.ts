/* eslint-disable max-lines-per-function */
import { AwaleNode, AwaleRules } from '../AwaleRules';
import { AwaleMove } from '../AwaleMove';
import { AwaleState } from '../AwaleState';
import { Table } from 'src/app/utils/ArrayUtils';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI';
import { Minimax } from 'src/app/jscaip/Minimax';
import { AwaleMoveGenerator } from '../AwaleMoveGenerator';
import { AwaleCaptureHeuristic } from '../AwaleCaptureHeuristic';

describe('AwaleCaptureHeuristic', () => {

    let rules: AwaleRules;
    let minimax: Minimax<AwaleMove, AwaleState>;
    const level1: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const level2: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 2 };

    beforeEach(() => {
        rules = AwaleRules.get();
        minimax = new Minimax('Capture Minimax', AwaleRules.get(), new AwaleCaptureHeuristic(), new AwaleMoveGenerator());
    });
    it('should not throw at first choice', () => {
        const node: AwaleNode = rules.getInitialNode();
        const bestMove: AwaleMove = minimax.chooseNextMove(node, level2);
        expect(rules.isLegal(bestMove, AwaleState.getInitialState()).isSuccess()).toBeTrue();
    });
    it('should choose capture when possible (at depth 1)', () => {
        // Given a state with a possible capture
        const board: Table<number> = [
            [4, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 1],
        ];
        const state: AwaleState = new AwaleState(board, 1, [0, 0]);
        const node: AwaleNode = new AwaleNode(state);
        // When getting the best move
        const bestMove: AwaleMove = minimax.chooseNextMove(node, level1);
        // Then the best move should be the capture
        expect(bestMove).toEqual(AwaleMove.TWO);
    });
    it('should choose capture when possible (at depth 2)', () => {
        // Given a state with a possible capture
        const board: Table<number> = [
            [0, 0, 0, 0, 3, 1],
            [0, 0, 0, 0, 1, 0],
        ];
        const state: AwaleState = new AwaleState(board, 1, [0, 0]);
        const node: AwaleNode = new AwaleNode(state);
        // When getting the best move
        const bestMove: AwaleMove = minimax.chooseNextMove(node, level2);
        // Then the best move should be the capture
        expect(bestMove).toEqual(AwaleMove.FOUR);
    });
    it('should prioritize moves in the same territory when no captures are possible', () => {
        // Given a state with only one move that distributes only in the player's territory
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 7],
            [0, 1, 0, 0, 0, 0],
        ];
        const state: AwaleState = new AwaleState(board, 1, [0, 0]);
        const node: AwaleNode = new AwaleNode(state);
        // When getting the best move
        const bestMove: AwaleMove = minimax.chooseNextMove(node, level1);
        // Then the best move should be the capture
        expect(bestMove).toEqual(AwaleMove.ZERO);
    });
});