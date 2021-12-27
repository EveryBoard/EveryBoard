/* eslint-disable max-lines-per-function */
import { AwaleNode, AwaleRules } from '../AwaleRules';
import { AwaleMinimax } from '../AwaleMinimax';
import { AwaleMove } from '../AwaleMove';
import { AwaleState } from '../AwaleState';

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
        const board: number[][] = [
            [4, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 1],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        const node: AwaleNode = new AwaleNode(state);
        const bestMove: AwaleMove = node.findBestMove(1, minimax);
        expect(bestMove).toEqual(AwaleMove.TWO);
    });
    it('should choose capture when possible (at depth 2)', () => {
        const board: number[][] = [
            [0, 0, 0, 0, 3, 1],
            [0, 0, 0, 0, 1, 0],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        const node: AwaleNode = new AwaleNode(state);
        const bestMove: AwaleMove = node.findBestMove(2, minimax);
        expect(bestMove).toEqual(AwaleMove.FOUR);
    });
});

