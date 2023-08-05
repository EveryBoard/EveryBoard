import { QuartoMoveGenerator } from 'src/app/games/quarto/QuartoMinimax';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { QuartoNode, QuartoRules } from 'src/app/games/quarto/QuartoRules';
import { QuartoState } from 'src/app/games/quarto/QuartoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { MCTS } from '../MCTS';
import { AIIterationLimitOptions } from '../MGPNode';

fdescribe('MCTS', () => {

    let mcts: MCTS<QuartoMove, QuartoState>;
    const mctsOptions: AIIterationLimitOptions = { name: 'Level 1', maxIterations: 1000 };

    beforeEach(() => {
        mcts = new MCTS('MCTS', new QuartoMoveGenerator(), QuartoRules.get());
    });
    fit('should not be stupid', () => {
        // Given a board that could be a win for opponent in their next moves
        const board: Table<QuartoPiece> = [
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABB, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 14, QuartoPiece.BBAA);
        const node = new QuartoNode(state);

        // When computing the best move
        const move = mcts.chooseNextMove(node, mctsOptions);
        // Then it should not give the win to the opponent
        expect(move.piece).not.toBe(QuartoPiece.AABA);
    });
    it('should know how to win multiple turns in advance', () => {
        // Given a board where we have to make a choice between possibly losing or winning,
        // but multiple turns in advance
        const board: Table<QuartoPiece> = [
            [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABA, QuartoPiece.EMPTY],
            [QuartoPiece.BABB, QuartoPiece.BAAB, QuartoPiece.ABAA, QuartoPiece.BBAB],
            [QuartoPiece.ABBA, QuartoPiece.BBAA, QuartoPiece.BABA, QuartoPiece.EMPTY],
            [QuartoPiece.AABB, QuartoPiece.ABBB, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 12, QuartoPiece.BBBB);
        const node = new QuartoNode(state);
        // When computing the best move
        const move = mcts.chooseNextMove(node, mctsOptions);
        // Then it should place it in (3,0) in order to definitely win
        // otherwise we definitely lose
        expect(move).toEqual(new QuartoMove(3, 0, QuartoPiece.ABAB));
    });
});
