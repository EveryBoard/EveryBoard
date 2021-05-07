import { AwaleRules } from '../AwaleRules';
import { AwaleMove } from '../AwaleMove';
import { AwalePartSlice } from '../AwalePartSlice';

describe('AwaleRules - Minimax:', () => {
    let rules: AwaleRules;

    beforeEach(() => {
        rules = new AwaleRules(AwalePartSlice);
    });
    it('should not throw at first choice', () => {
        const bestMove: AwaleMove = rules.node.findBestMove(2);
        expect(rules.isLegal(bestMove, rules.node.gamePartSlice).legal.isSuccess()).toBeTrue();
    });
});
