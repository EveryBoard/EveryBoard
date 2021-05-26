import { Player } from 'src/app/jscaip/Player';
import { PentagoMinimax } from '../PentagoMinimax.spec';
import { PentagoRules } from '../PentagoRules';
import { PentagoState } from '../PentagoState';

fdescribe('PentagoMinimax', () => {

    let rules: PentagoRules;
    let minimax: PentagoMinimax;
    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    beforeEach(() => {
        rules = new PentagoRules(PentagoState);
        minimax = new PentagoMinimax('PentagoMinimax');
    });
    fit('Should propose 100 move at first turn like a stupid thing', () => {
        expect(minimax.getListMoves(rules.node).length).toBe(100);
    });
});
