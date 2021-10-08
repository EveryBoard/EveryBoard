import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { ReversiMinimax } from '../ReversiMinimax';
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { ReversiRules } from '../ReversiRules';
import { Table } from 'src/app/utils/ArrayUtils';

describe('ReversiMinimax', () => {

    const _: Player = Player.NONE;
    const X: Player = Player.ONE;
    const O: Player = Player.ZERO;

    let rules: ReversiRules;
    let minimax: ReversiMinimax;

    beforeEach(() => {
        rules = new ReversiRules(ReversiState);
        minimax = new ReversiMinimax(rules, 'ReversiMinimax');
    });
    it('should have 4 choices at first turn', () => {
        const moves: ReversiMove[] = minimax.getListMoves(rules.node);
        expect(moves.length).toBe(4);
    });
    it('should not throw at first choice', () => {
        const bestMove: ReversiMove = rules.node.findBestMove(2, minimax);
        expect(rules.isLegal(bestMove, rules.node.gameState).legal.isSuccess()).toBeTrue();
    });
    it('should prioritize taking control of the corners', () => {
        const board: Table<Player> = [
            [_, X, O, _, _, _, _, _],
            [_, _, X, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: ReversiState = new ReversiState(board, 2);
        rules.node = new MGPNode(null, null, state);
        const bestMove: ReversiMove = rules.node.findBestMove(2, minimax);
        expect(bestMove.equals(new ReversiMove(0, 0)));
    });
    it('Should propose passing move when no other moves are possible', () => {
        const board: Table<Player> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, O, _, _, _],
        ];
        const state: ReversiState = new ReversiState(board, 1);
        rules.node = new MGPNode(null, null, state);
        const moves: ReversiMove[] = minimax.getListMoves(rules.node);
        expect(moves.length).toBe(1);
        expect(moves[0]).toBe(ReversiMove.PASS);
    });
});
