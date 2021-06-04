import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { QuixoPartSlice } from '../QuixoPartSlice';
import { QuixoMove } from '../QuixoMove';
import { QuixoMinimax } from '../QuixoMinimax';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { QuixoRules } from '../QuixoRules';

describe('QuixoMinimax:', () => {
    let minimax: QuixoMinimax;
    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    beforeEach(() => {
        const rules: QuixoRules = new QuixoRules(QuixoPartSlice);
        minimax = new QuixoMinimax(rules, 'QuixoMinimax');
    });

    it('Should calcule board value according to longest line differences', () => {
        const board: number[][] = [
            [X, _, _, _, O],
            [X, _, _, _, O],
            [_, _, _, _, _],
            [_, _, _, _, O],
            [X, _, _, _, O],
        ];
        const slice: QuixoPartSlice = new QuixoPartSlice(board, 0);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        expect(minimax.getBoardValue(new MGPNode(null, move, slice)).value).toEqual(-1);
    });
});
