import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { QuixoState } from '../QuixoState';
import { QuixoMove } from '../QuixoMove';
import { QuixoMinimax } from '../QuixoMinimax';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { QuixoRules } from '../QuixoRules';
import { Table } from 'src/app/utils/ArrayUtils';

describe('QuixoMinimax:', () => {

    let minimax: QuixoMinimax;
    const _: Player = Player.NONE;
    const X: Player = Player.ONE;
    const O: Player = Player.ZERO;

    beforeEach(() => {
        const rules: QuixoRules = new QuixoRules(QuixoState);
        minimax = new QuixoMinimax(rules, 'QuixoMinimax');
    });

    it('Should calcule board value according to longest line differences', () => {
        const board: Table<Player> = [
            [X, _, _, _, O],
            [X, _, _, _, O],
            [_, _, _, _, _],
            [_, _, _, _, O],
            [X, _, _, _, O],
        ];
        const state: QuixoState = new QuixoState(board, 0);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        expect(minimax.getBoardValue(new MGPNode(null, move, state)).value).toEqual(-1);
    });
});
