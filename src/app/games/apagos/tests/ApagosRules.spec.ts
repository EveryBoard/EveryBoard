/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { ApagosCoord } from '../ApagosCoord';
import { ApagosFailure } from '../ApagosFailure';
import { ApagosMove } from '../ApagosMove';
import { ApagosNode, ApagosRules } from '../ApagosRules';
import { ApagosState } from '../ApagosState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('ApagosRules', () => {

    let rules: ApagosRules;
    const defaultConfig: NoConfig = ApagosRules.get().getDefaultRulesConfig();

    let stateWithOneFullSquare: ApagosState;

    beforeAll(() => {
        stateWithOneFullSquare = ApagosState.fromRepresentation(3, [
            [0, 0, 2, 0],
            [0, 0, 1, 0],
            [7, 5, 3, 1],
        ], ApagosRules.PIECES_PER_PLAYER - 2, ApagosRules.PIECES_PER_PLAYER - 1);
    });
    beforeEach(() => {
        rules = ApagosRules.get();
    });

    it('should refuse dropping on a full square', () => {
        // Given a board with one full square
        const state: ApagosState = stateWithOneFullSquare;
        // When dropping on that full square
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.TWO, Player.ONE);
        // Then move should be illegal
        const reason: string = ApagosFailure.CANNOT_LAND_ON_A_FULL_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should refuse slide down from a square not containing piece to slide', () => {
        // Given the initial board
        const state: ApagosState = ApagosRules.get().getInitialState();
        // When doing a slide down
        const move: ApagosMove = ApagosMove.transfer(ApagosCoord.ONE, ApagosCoord.ZERO).get();
        // Then it should not be legal
        const reason: string = ApagosFailure.NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should refuse moving on a full square', () => {
        // Given a board with one full square and one piece higher
        const state: ApagosState = ApagosState.fromRepresentation(4, [
            [0, 0, 2, 0],
            [0, 0, 1, 1],
            [7, 5, 3, 1],
        ], ApagosRules.PIECES_PER_PLAYER - 2, ApagosRules.PIECES_PER_PLAYER - 2);
        // When moving a piece on it
        const move: ApagosMove = ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.TWO).get();
        // Then it should not be legal
        const reason: string = ApagosFailure.CANNOT_LAND_ON_A_FULL_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should slide piece down', () => {
        // Given a board with a movable piece
        const state: ApagosState = stateWithOneFullSquare;
        // When sliding it
        const move: ApagosMove = ApagosMove.transfer(ApagosCoord.TWO, ApagosCoord.ONE).get();
        // Then it should have been moved down
        const expectedState: ApagosState = ApagosState.fromRepresentation(4, [
            [0, 0, 2, 0],
            [0, 1, 0, 0],
            [7, 5, 3, 1],
        ], ApagosRules.PIECES_PER_PLAYER - 2, ApagosRules.PIECES_PER_PLAYER - 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should refuse to drop when there is no longer enough pieces', () => {
        // Given a board with all piece of Player.ZERO on the board
        const state: ApagosState = ApagosState.fromRepresentation(10, [
            [6, 0, 3, 1],
            [0, 0, 0, 0],
            [7, 5, 3, 1],
        ], 0, ApagosRules.PIECES_PER_PLAYER);
        // When dropping a Player.ZERO piece
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.ONE, Player.ZERO);
        // Then move should be illegal
        const reason: string = ApagosFailure.NO_PIECE_REMAINING_TO_DROP();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should drop piece when on low square', () => {
        // Given the initial board
        const state: ApagosState = ApagosRules.get().getInitialState();
        // When dropping piece on one of the 3 low squares
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.ONE, Player.ZERO);
        // Then the square should climb one place up
        const expectedState: ApagosState = ApagosState.fromRepresentation(1, [
            [0, 0, 1, 0],
            [0, 0, 0, 0],
            [7, 3, 5, 1],
        ], ApagosRules.PIECES_PER_PLAYER - 1, ApagosRules.PIECES_PER_PLAYER);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should drop piece when on higher square', () => {
        // Given the initial board
        const state: ApagosState = ApagosRules.get().getInitialState();
        // When dropping piece on one of the 3 low squares
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.THREE, Player.ZERO);
        // Then the square should not move
        const expectedState: ApagosState = ApagosState.fromRepresentation(1, [
            [0, 0, 0, 1],
            [0, 0, 0, 0],
            [7, 5, 3, 1],
        ], ApagosRules.PIECES_PER_PLAYER - 1, ApagosRules.PIECES_PER_PLAYER);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should know who is winning (Player.ZERO)', () => {
        // Given a ended part state
        const state: ApagosState = ApagosState.fromRepresentation(20, [
            [7, 0, 0, 1],
            [0, 5, 3, 0],
            [7, 5, 3, 1],
        ], 0, 0);
        // Then we should know who won
        const node: ApagosNode = new ApagosNode(state);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
    });

    it('should know who is winning (Player.ONE)', () => {
        // Given a ended part state
        const state: ApagosState = ApagosState.fromRepresentation(20, [
            [7, 0, 1, 0],
            [0, 5, 2, 1],
            [7, 5, 3, 1],
        ], 0, 0);
        // Then we should know who won
        const node: ApagosNode = new ApagosNode(state);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
    });

});
