/* eslint-disable max-lines-per-function */
import { MinimaxTestingNode, MinimaxTestingRules } from '../MinimaxTestingRules';
import { MinimaxTestingState } from '../MinimaxTestingState';
import { MinimaxTestingMove } from '../MinimaxTestingMove';
import { MinimaxTestingMinimax } from '../MinimaxTestingMinimax';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';

describe('MinimaxTestingRules', () => {

    let rules: MinimaxTestingRules;
    let minimaxes: Minimax<MinimaxTestingMove, MinimaxTestingState>[];

    beforeEach(() => {
        rules = new MinimaxTestingRules(MinimaxTestingState);
        minimaxes = [
            new MinimaxTestingMinimax(rules, 'MinimaxTesting'),
        ];
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('should be a victory of second player', () => {
        MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
        expect(rules.choose(MinimaxTestingMove.RIGHT)).toBeTrue();
        RulesUtils.expectToBeVictoryFor(rules, rules.node, Player.ONE, minimaxes);
    });
    it('should refuse to go right when on the extreme right', () => {
        // Given a board where you are on the right
        const state: MinimaxTestingState = new MinimaxTestingState(3, new Coord(3, 0));

        // When attempting to go right
        const move: MinimaxTestingMove = MinimaxTestingMove.RIGHT;

        // should refuse
        RulesUtils.expectMoveFailure(rules, state, move, 'incorrect move');
    });
    it('should refuse to go down when on the bottom', () => {
        // Given a board where you are on the right
        const state: MinimaxTestingState = new MinimaxTestingState(3, new Coord(0, 3));

        // When attempting to go right
        const move: MinimaxTestingMove = MinimaxTestingMove.DOWN;

        // should refuse
        RulesUtils.expectMoveFailure(rules, state, move, 'incorrect move');
    });
    describe('GameStatus', () => {
        it('should recognize victory when on the player victory value (Player.ONE)', () => {
            MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
            const state: MinimaxTestingState = new MinimaxTestingState(1, new Coord(1, 0));

            const node: MinimaxTestingNode = new MinimaxTestingNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
        it('should recognize victory when on the player victory value (Player.ZERO)', () => {
            MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
            const state: MinimaxTestingState = new MinimaxTestingState(2, new Coord(0, 2));

            const node: MinimaxTestingNode = new MinimaxTestingNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
        it('should recognize ongoing part', () => {
            const state: MinimaxTestingState = new MinimaxTestingState(2, new Coord(0, 0));

            const node: MinimaxTestingNode = new MinimaxTestingNode(state);
            RulesUtils.expectToBeOngoing(rules, node, minimaxes);
        });
        it('should recognize victory when part is over and score is positive (Player.ZERO)', () => {
            MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
            const state: MinimaxTestingState = new MinimaxTestingState(6, new Coord(3, 3));

            const node: MinimaxTestingNode = new MinimaxTestingNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
        it('should recognize victory when part is over and score is positive (Player.ONE)', () => {
            MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_4;
            const state: MinimaxTestingState = new MinimaxTestingState(6, new Coord(3, 3));

            const node: MinimaxTestingNode = new MinimaxTestingNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
    });
});
