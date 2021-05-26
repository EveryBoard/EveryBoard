import { PentagoMinimax } from '../PentagoMinimax.spec';
import { PentagoRules } from '../PentagoRules';
import { PentagoState } from '../PentagoState';

describe('PentagoMinimax', () => {

    let rules: PentagoRules;
    let minimax: PentagoMinimax;

    beforeEach(() => {
        rules = new PentagoRules(PentagoState);
        minimax = new PentagoMinimax('PentagoMinimax');
    });
    it('Should propose 100 move at first turn like a stupid thing', () => {
        expect(minimax.getListMoves(rules.node).length).toBe(100);
    });
});
