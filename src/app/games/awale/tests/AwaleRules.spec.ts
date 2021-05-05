import { AwaleRules } from '../AwaleRules';
import { AwaleMove } from '../AwaleMove';
import { AwalePartSlice } from '../AwalePartSlice';

describe('AwaleRules', () => {
    let rules: AwaleRules;

    beforeEach(() => {
        rules = new AwaleRules(AwalePartSlice);
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.choose(new AwaleMove(0, 0))).toBeTrue();
    });
});
