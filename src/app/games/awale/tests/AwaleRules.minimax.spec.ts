import { AwaleMinimax, AwaleRules } from '../AwaleRules';
import { AwaleMove } from '../AwaleMove';
import { AwalePartSlice } from '../AwalePartSlice';

describe('AwaleRules - Minimax:', () => {

    let rules: AwaleRules;

    let minimax: AwaleMinimax;

    beforeEach(() => {
        rules = new AwaleRules(AwalePartSlice);
        minimax = new AwaleMinimax('AwaleMinimax');
    });
    it('should not throw at first choice', () => {
        const bestMove: AwaleMove = rules.node.findBestMove(2, minimax);
        expect(rules.isLegal(bestMove, rules.node.gamePartSlice).legal.isSuccess()).toBeTrue();
    });
});
