import { QuartoMinimax } from 'src/app/games/quarto/QuartoMinimax';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { QuartoNode, QuartoRules } from 'src/app/games/quarto/QuartoRules';
import { QuartoState } from 'src/app/games/quarto/QuartoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { Coord } from '../Coord';
import { MCTS } from '../MCTS';

fdescribe('MCTS on quarto', () => {
    let rules: QuartoRules;
    let minimax: QuartoMinimax;
    let mcts;

    beforeEach(() => {
        rules = new QuartoRules(QuartoState);
        minimax = new QuartoMinimax(rules, 'QuartoMinimax');
        mcts = new MCTS(minimax, rules);
    });
    it('should not be stupid', () => {
        // Given a board that could be a win for opponent in their next moves
        const board: Table<QuartoPiece> = [
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABB, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 3, QuartoPiece.BBAA);
        const node = new QuartoNode(state);

        // When computing the best move
        const move = mcts.search(node, 1000);
        // Then it should not give the win to the opponent
        console.log(move.piece)
        expect(move.piece).not.toBe(QuartoPiece.AABA);
    });
    fit('should clearly know how to win', () => {
        // Given a board where we have to make a choice between possibly losing, or definitely winning
        const board: Table<QuartoPiece> = [
            [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABA, QuartoPiece.EMPTY],
            [QuartoPiece.BABB, QuartoPiece.ABAA, QuartoPiece.ABAB, QuartoPiece.BAAB],
            [QuartoPiece.ABBA, QuartoPiece.BBAA, QuartoPiece.BAAA, QuartoPiece.BABA],
            [QuartoPiece.AABB, QuartoPiece.ABBB, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 0, QuartoPiece.BBAB);
        const node = new QuartoNode(state);
        // When computing the best move
        // Remaining pieces: BBBA, BBBB
        // We cannot put it in (3, 0) nor in (3, 3), otherwise opponent gets a 50% random win.
        // If we put it in (2, 3), we get a 100% win chance.
        const move = mcts.search(node, 10);
        // Then it should place it in (2,3)
        expect(move.coord).toEqual(new Coord(2, 3));
    });
});
