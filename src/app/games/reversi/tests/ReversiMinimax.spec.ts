import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { ReversiMinimax } from '../ReversiMinimax';
import { ReversiMove } from '../ReversiMove';
import { ReversiPartSlice } from '../ReversiPartSlice';
import { ReversiRules } from '../ReversiRules';

describe('ReversiMinimax', () => {
    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    let rules: ReversiRules;
    let minimax: ReversiMinimax;

    beforeEach(() => {
        rules = new ReversiRules(ReversiPartSlice);
        minimax = new ReversiMinimax(rules, 'ReversiMinimax');
    });
    it('should not throw at first choice', () => {
        const bestMove: ReversiMove = rules.node.findBestMove(2, minimax);
        expect(rules.isLegal(bestMove, rules.node.gamePartSlice).legal.isSuccess()).toBeTrue();
    });
    it('should prioritize taking control of the corners', () => {
        const board: number[][] = [
            [_, X, O, _, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const slice: ReversiPartSlice = new ReversiPartSlice(board, 2);
        rules.node = new MGPNode(null, null, slice);
        const bestMove: ReversiMove = rules.node.findBestMove(2, minimax);
        expect(bestMove.equals(new ReversiMove(0, 0)));
    });
});
