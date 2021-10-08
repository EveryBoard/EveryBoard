import { PentagoMinimax } from '../PentagoMinimax';
import { PentagoRules } from '../PentagoRules';
import { PentagoState } from '../PentagoState';

describe('PentagoMinimax', () => {

    let rules: PentagoRules;
    let minimax: PentagoMinimax;

    beforeEach(() => {
        rules = new PentagoRules(PentagoState);
        minimax = new PentagoMinimax(rules, 'PentagoMinimax');
    });
    it('Should propose 36 moves at first turn', () => {
        expect(minimax.getListMoves(rules.node).length).toBe(36);
    });
});
