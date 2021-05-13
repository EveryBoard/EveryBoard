import { AwaleMinimax, AwaleRules } from '../AwaleRules';
import { AwaleMove } from '../AwaleMove';
import { AwalePartSlice } from '../AwalePartSlice';
import { MGPNode } from 'src/app/jscaip/MGPNode';

describe('AwaleMinimax:', () => {

    let rules: AwaleRules;

    let minimax: AwaleMinimax;

    beforeEach(() => {
        rules = new AwaleRules(AwalePartSlice);
        minimax = new AwaleMinimax('AwaleMinimax');
        console.clear()
    });
    it('should not throw at first choice', () => {
        const bestMove: AwaleMove = rules.node.findBestMove(2, minimax);
        expect(rules.isLegal(bestMove, rules.node.gamePartSlice).legal.isSuccess()).toBeTrue();
    });
    it('should choose capture when possible (at depth 1)', () => {
        const board: number[][] = [
            [4, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 1],
        ];
        const state: AwalePartSlice = new AwalePartSlice(board, 0, [0, 0]);
        const node: MGPNode<AwaleRules, AwaleMove, AwalePartSlice> = new MGPNode(null, null, state);
        const bestMove: AwaleMove = node.findBestMove(1, minimax);
        expect(bestMove).toEqual(new AwaleMove(2, 0));
    });
    it('should choose capture when possible (at depth 2)', () => {
        const board: number[][] = [
            [0, 0, 0, 0, 3, 1],
            [0, 0, 0, 0, 1, 0],
        ];
        const state: AwalePartSlice = new AwalePartSlice(board, 0, [0, 0]);
        const node: MGPNode<AwaleRules, AwaleMove, AwalePartSlice> = new MGPNode(null, null, state);
        console.clear();
        const bestMove: AwaleMove = node.findBestMove(2, minimax);
        expect(bestMove).toEqual(new AwaleMove(4, 0));
    });
});

