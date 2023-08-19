/* eslint-disable max-lines-per-function */
import { KalahScoreMinimax } from '../KalahDummyMinimax';
import { KalahMove } from '../KalahMove';
import { KalahNode } from '../KalahRules';
import { MancalaState } from '../../commons/MancalaState';
import { MancalaDistribution } from '../../commons/MancalaMove';

describe('KalahDummyMinimax', () => {

    let minimax: KalahScoreMinimax;

    beforeEach(() => {
        minimax = new KalahScoreMinimax();
    });
    it('should have all move options', () => {
        // Given an initial node
        const initialState: MancalaState = MancalaState.getInitialState();
        const node: KalahNode = new KalahNode(initialState);

        // When computing the list of moves
        const moves: KalahMove[] = minimax.getListMoves(node);

        // Then there should be 5 moves of one sub-moves, and 5 moves of two sub-moves
        expect(moves.length).toBe(10);
    });
    it('Given a state where possible moves must end in kalah', () => {
        // Given a state with possible moves
        const state: MancalaState = new MancalaState([
            [5, 2, 3, 2, 1, 2],
            [1, 0, 0, 0, 0, 0],
        ], 24, [13, 20]);
        const node: KalahNode = new KalahNode(state);

        // When calculating the list of possible moves
        const moves: KalahMove[] = minimax.getListMoves(node);

        // Then there should be thoses moves
        expect(moves.length).toBe(1);
    });
    it('should choose longest distribution when there is no capture', () => {
        // Given a board with a big distribution possible
        const board: number[][] = [
            [0, 0, 0, 3, 2, 1],
            [1, 2, 3, 0, 0, 0],
        ];
        const state: MancalaState = new MancalaState(board, 0, [0, 0]);
        const node: KalahNode = new KalahNode(state);

        // When choosing the best choice
        const expectedBestMove: KalahMove =
            KalahMove.of(MancalaDistribution.ZERO,
                         [
                             MancalaDistribution.ONE,
                             MancalaDistribution.ZERO,
                             MancalaDistribution.TWO,
                             MancalaDistribution.ZERO,
                             MancalaDistribution.ONE,
                         ]);
        const best: KalahMove = node.findBestMove(1, minimax);

        // Then the minimax should take it
        expect(best).toEqual(expectedBestMove);
    });
});
