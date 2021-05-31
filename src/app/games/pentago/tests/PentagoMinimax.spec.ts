import { PentagoMinimax } from '../PentagoMinimax';
import { PentagoRules } from '../PentagoRules';
import { PentagoGameState } from '../PentagoGameState';

describe('PentagoMinimax', () => {

    let rules: PentagoRules;
    let minimax: PentagoMinimax;

    beforeEach(() => {
        rules = new PentagoRules(PentagoGameState);
        minimax = new PentagoMinimax('PentagoMinimax');
    });
    it('Should propose 36 moves at first turn', () => {
        expect(minimax.getListMoves(rules.node).length).toBe(36);
    });
});
