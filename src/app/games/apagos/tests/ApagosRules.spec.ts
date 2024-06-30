/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { ApagosFailure } from '../ApagosFailure';
import { ApagosMove } from '../ApagosMove';
import { ApagosConfig, ApagosNode, ApagosRules } from '../ApagosRules';
import { ApagosState } from '../ApagosState';

describe('ApagosRules', () => {

    let rules: ApagosRules;
    const defaultConfig: MGPOptional<ApagosConfig> = ApagosRules.get().getDefaultRulesConfig();

    let stateWithOneFullSquare: ApagosState;

    beforeAll(() => {
        stateWithOneFullSquare = ApagosState.fromRepresentation(3, [
            [0, 0, 2, 0],
            [0, 0, 1, 0],
            [7, 5, 3, 1],
        ], 8, 9);
    });
    beforeEach(() => {
        rules = ApagosRules.get();
    });

    it('should refuse dropping on a full square', () => {
        // Given a board with one full square
        const state: ApagosState = stateWithOneFullSquare;

        // When dropping on that full square
        const move: ApagosMove = ApagosMove.drop(2, Player.ONE);

        // Then the move should be illegal
        const reason: string = ApagosFailure.CANNOT_LAND_ON_A_FULL_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should refuse slide down from a square not containing piece to slide', () => {
        // Given the initial board
        const state: ApagosState = ApagosRules.get().getInitialState(defaultConfig);

        // When doing a slide down
        const move: ApagosMove = ApagosMove.transfer(1, 0).get();

        // Then the move should be illegal
        const reason: string = ApagosFailure.NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should refuse moving on a full square', () => {
        // Given a board with one full square and one piece higher
        const state: ApagosState = ApagosState.fromRepresentation(4, [
            [0, 0, 2, 0],
            [0, 0, 1, 1],
            [7, 5, 3, 1],
        ], 8, 8);

        // When moving a piece on it
        const move: ApagosMove = ApagosMove.transfer(3, 2).get();

        // Then the move should be illegal
        const reason: string = ApagosFailure.CANNOT_LAND_ON_A_FULL_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should slide piece down', () => {
        // Given a board with a movable piece
        const state: ApagosState = stateWithOneFullSquare;
        // When sliding it
        const move: ApagosMove = ApagosMove.transfer(2, 1).get();
        // Then it should have been moved down
        const expectedState: ApagosState = ApagosState.fromRepresentation(4, [
            [0, 0, 2, 0],
            [0, 1, 0, 0],
            [7, 5, 3, 1],
        ], 8, 9);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should refuse to drop when there is no longer enough pieces', () => {
        // Given a board with all pieces of Player.ZERO on the board
        const state: ApagosState = ApagosState.fromRepresentation(10, [
            [6, 0, 3, 1],
            [0, 0, 0, 0],
            [7, 5, 3, 1],
        ], 0, 10);

        // When dropping a Player.ZERO piece
        const move: ApagosMove = ApagosMove.drop(1, Player.ZERO);

        // Then the move should be illegal
        const reason: string = ApagosFailure.NO_PIECE_REMAINING_TO_DROP();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should drop piece when on low square', () => {
        // Given the initial board
        const state: ApagosState = ApagosRules.get().getInitialState(defaultConfig);
        // When dropping piece on one of the 3 low squares
        const move: ApagosMove = ApagosMove.drop(1, Player.ZERO);
        // Then the square should climb one place up
        const expectedState: ApagosState = ApagosState.fromRepresentation(1, [
            [0, 0, 1, 0],
            [0, 0, 0, 0],
            [7, 3, 5, 1],
        ], 9, 10);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should drop piece when on higher square', () => {
        // Given the initial board
        const state: ApagosState = ApagosRules.get().getInitialState(defaultConfig);
        // When dropping piece on one of the 3 low squares
        const move: ApagosMove = ApagosMove.drop(3, Player.ZERO);
        // Then the square should not move
        const expectedState: ApagosState = ApagosState.fromRepresentation(1, [
            [0, 0, 0, 1],
            [0, 0, 0, 0],
            [7, 5, 3, 1],
        ], 9, 10);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    describe('game status', () => {

        it('should be ongoing if there are still non-full squares', () => {
            // Given a state with non-full squares
            const state: ApagosState = ApagosRules.get().getInitialState(defaultConfig);
            const node: ApagosNode = new ApagosNode(state);
            // When checking the game status
            // Then it should be ongoing
            RulesUtils.expectToBeOngoing(rules, node, defaultConfig);
        });

        it('should detect victory for Player.ZERO', () => {
            // Given a ended state with victory from Player.ZERO
            const state: ApagosState = ApagosState.fromRepresentation(20, [
                [7, 0, 0, 1],
                [0, 5, 3, 0],
                [7, 5, 3, 1],
            ], 0, 0);
            const node: ApagosNode = new ApagosNode(state);
            // When checking the game status
            // Then it should be a victory for Player.ZERO
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it('should detect victory for Player.ONE', () => {
            // Given a ended state with victory from Player.ONE
            const state: ApagosState = ApagosState.fromRepresentation(20, [
                [7, 0, 1, 0],
                [0, 5, 2, 1],
                [7, 5, 3, 1],
            ], 0, 0);
            const node: ApagosNode = new ApagosNode(state);
            // When checking the game status
            // Then it should be a victory for Player.ONE
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

        it('should detect victory in case where the last square is evenly divided', () => {
            // Given a full board with highest space evenly split but second square dominated by Player ONE
            const state: ApagosState = ApagosState.fromRepresentation(20, [
                [7, 0, 1, 1],
                [0, 5, 2, 1],
                [7, 5, 3, 2],
            ], 0, 0);
            const node: ApagosNode = new ApagosNode(state);
            // When checking the game status
            // Then it should be a victory for Player.ONE
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

        it('should detect draw', () => {
            // Given a ended state that is a full draw
            const state: ApagosState = ApagosState.fromRepresentation(20, [
                [4, 3, 2, 1],
                [4, 3, 2, 1],
                [8, 6, 4, 2],
            ], 0, 0);
            const node: ApagosNode = new ApagosNode(state);
            // When checking the game status
            // Then it should be detected as a draw
            RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        });
    });

});
