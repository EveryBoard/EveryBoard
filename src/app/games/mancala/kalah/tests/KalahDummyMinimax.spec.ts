/* eslint-disable max-lines-per-function */
import { KalahScoreMinimax } from '../KalahDummyMinimax';
import { KalahMove } from '../KalahMove';
import { KalahNode, KalahRules } from '../KalahRules';
import { MancalaState } from '../../commons/MancalaState';
import { MancalaDistribution } from '../../commons/MancalaMove';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';

describe('KalahDummyMinimax', () => {

    let minimax: KalahScoreMinimax;

    beforeEach(() => {
        minimax = new KalahScoreMinimax();
    });
    it('should have all move options', () => {
        // Given an initial node
        const initialState: MancalaState = MancalaState.getInitialState(KalahRules.DEFAULT_CONFIG);
        const node: KalahNode = new KalahNode(initialState);

        // When computing the list of moves
        const moves: KalahMove[] = minimax.getListMoves(node);

        // Then there should be 5 moves of one sub-moves, and 5 moves of two sub-moves
        expect(moves.length).toBe(10);
    });
    it('Given a state where possible moves must end in Kalah', () => {
        // Given a state with possible moves
        const state: MancalaState = new MancalaState([
            [5, 2, 3, 2, 1, 2],
            [1, 0, 0, 0, 0, 0],
        ], 24, [13, 20], 4);
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
        const state: MancalaState = new MancalaState(board, 0, [0, 0], 4);
        const node: KalahNode = new KalahNode(state);

        // When choosing the best choice
        const expectedBestMove: KalahMove =
            KalahMove.of(MancalaDistribution.of(0),
                         [
                             MancalaDistribution.of(1),
                             MancalaDistribution.of(0),
                             MancalaDistribution.of(2),
                             MancalaDistribution.of(0),
                             MancalaDistribution.of(1),
                         ]);
        const best: KalahMove = node.findBestMove(1, minimax);

        // Then the minimax should take it
        expect(best).toEqual(expectedBestMove);
    });
    it('should board with better score', () => {
        // Given a board with a big score
        const board: number[][] = [
            [0, 0, 0, 3, 2, 1],
            [1, 2, 3, 0, 0, 0],
        ];
        const strongState: MancalaState = new MancalaState(board, 0, [10, 0], 4);
        // And a board with a little score
        const weakState: MancalaState = new MancalaState(board, 0, [0, 0], 4);

        // When comparing both
        // Then the bigger score should be better
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState,
                                                           MGPOptional.empty(),
                                                           strongState,
                                                           MGPOptional.empty(),
                                                           Player.ZERO);
    });
});
