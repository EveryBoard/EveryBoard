/* eslint-disable max-lines-per-function */
import { KalahMove } from '../KalahMove';
import { KalahNode, KalahRules } from '../KalahRules';
import { MancalaState } from '../../common/MancalaState';
import { MancalaDistribution } from '../../common/MancalaMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { KalahMoveGenerator } from '../KalahMoveGenerator';
import { KalahScoreHeuristic } from '../KalahScoreHeuristic';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';

describe('KalahMoveGenerator', () => {

    let moveGenerator: KalahMoveGenerator;

    beforeEach(() => {
        moveGenerator = new KalahMoveGenerator();
    });
    it('should have all move options', () => {
        // Given an initial node
        const initialState: MancalaState = MancalaState.getInitialState();
        const node: KalahNode = new KalahNode(initialState);

        // When computing the list of moves
        const moves: KalahMove[] = moveGenerator.getListMoves(node);

        // Then there should be 5 moves of one sub-moves, and 5 moves of two sub-moves
        expect(moves.length).toBe(10);
    });
    it('Given a state where possible moves must end in Kalah', () => {
        // Given a state with possible moves
        const state: MancalaState = new MancalaState([
            [5, 2, 3, 2, 1, 2],
            [1, 0, 0, 0, 0, 0],
        ], 24, [13, 20]);
        const node: KalahNode = new KalahNode(state);

        // When calculating the list of possible moves
        const moves: KalahMove[] = moveGenerator.getListMoves(node);

        // Then there should be those moves
        expect(moves.length).toBe(1);
    });
});

describe('KalahScoreMinimax', () => {

    let minimax: Minimax<KalahMove, MancalaState>;

    beforeEach(() => {
        minimax = new Minimax('Score', KalahRules.get(), new KalahScoreHeuristic(), new KalahMoveGenerator());
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
        const best: KalahMove = minimax.chooseNextMove(node, { name: 'Level 1', maxDepth: 1 });

        // Then the minimax should take it
        expect(best).toEqual(expectedBestMove);
    });
});

describe('KalahHeuristic', () => {

    let heuristic: KalahScoreHeuristic;

    beforeEach(() => {
        heuristic = new KalahScoreHeuristic();
    });
    it('should prefer board with better score', () => {
        // Given a board with a big score
        const board: number[][] = [
            [0, 0, 0, 3, 2, 1],
            [1, 2, 3, 0, 0, 0],
        ];
        const strongState: MancalaState = new MancalaState(board, 0, [10, 0]);
        // And a board with a little score
        const weakState: MancalaState = new MancalaState(board, 0, [0, 0]);

        // When comparing both
        // Then the bigger score should be better
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState,
                                                               MGPOptional.empty(),
                                                               strongState,
                                                               MGPOptional.empty(),
                                                               Player.ZERO);
    });
});
