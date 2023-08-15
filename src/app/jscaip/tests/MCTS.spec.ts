/* eslint-disable max-lines-per-function */
import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwaleMoveGenerator } from 'src/app/games/awale/AwaleMoveGenerator';
import { AwaleRules } from 'src/app/games/awale/AwaleRules';
import { AwaleState } from 'src/app/games/awale/AwaleState';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoMoveGenerator } from 'src/app/games/quarto/QuartoMoveGenerator';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { QuartoNode, QuartoRules } from 'src/app/games/quarto/QuartoRules';
import { QuartoState } from 'src/app/games/quarto/QuartoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { AITimeLimitOptions } from '../AI';
import { Coord } from '../Coord';
import { MCTS } from '../MCTS';

describe('MCTS', () => {

    let mcts: MCTS<QuartoMove, QuartoState>;
    const mctsOptions: AITimeLimitOptions = { name: '100ms', maxSeconds: 0.1 };

    beforeEach(() => {
        mcts = new MCTS('MCTS', new QuartoMoveGenerator(), QuartoRules.get());
    });
    it('should not be stupid', () => {
        // Given a board that could be a win for opponent in their next moves
        const board: Table<QuartoPiece> = [
            [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABB, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 14, QuartoPiece.BBAA);
        const node: QuartoNode = new QuartoNode(state);

        // When computing the best move
        const move: QuartoMove = mcts.chooseNextMove(node, mctsOptions);
        // Then it should not give the win to the opponent
        console.log(move);
        if (move.coord.equals(new Coord(3, 0))) {
            // MCTS blocked the opponent's only possible win
            expect(true).toBe(true);
        } else {
            // MCTS gave the opponent a piece with which they cannot win
            expect(move.piece).not.toBe(QuartoPiece.AABA);
        }
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
        const node: QuartoNode = new QuartoNode(state);
        // When computing the best move
        const move: QuartoMove = mcts.chooseNextMove(node, mctsOptions);
        // Then it should place it in (3,0) in order to definitely win
        // otherwise we definitely lose
        expect(move).toEqual(new QuartoMove(3, 0, QuartoPiece.ABAB));
    });
    it('should not fail on games that are too long', () => {
        // Given a MCTS for a game that has a tendency to give long random games
        const otherMcts: MCTS<AwaleMove, AwaleState> = new MCTS('MCTS', new AwaleMoveGenerator(), AwaleRules.get());
        otherMcts.maxGameLength = 10; // Limit it heavily to ensure we will exhaust the limit (for coverage)
        // When searching for the best move
        const beforeSearch: number = Date.now();
        const move: AwaleMove = otherMcts.chooseNextMove(AwaleRules.get().getInitialNode(), mctsOptions);
        // Then it should find one and not get stuck infinitely
        expect(move).toBeTruthy();
        // Add 10% to allow for iterations to finish
        expect(Date.now() - beforeSearch).toBeLessThan(1000 * (mctsOptions.maxSeconds + 0.1));
    });
});