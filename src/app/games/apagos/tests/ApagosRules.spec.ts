import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { ApagosCoord } from '../ApagosCoord';
import { ApagosDummyMinimax } from '../ApagosDummyMinimax';
import { ApagosFailure } from '../ApagosFailure';
import { ApagosMove } from '../ApagosMove';
import { ApagosNode, ApagosRules } from '../ApagosRules';
import { ApagosState } from '../ApagosState';

describe('ApagosRules', () => {

    let rules: ApagosRules;

    let minimaxes: Minimax<ApagosMove, ApagosState>[];

    let stateWithOneFullSquare: ApagosState;

    beforeAll(() => {
        stateWithOneFullSquare = ApagosState.fromRepresentation(3, [
            [0, 0, 2, 0],
            [0, 0, 1, 0],
            [7, 5, 3, 1],
        ], ApagosState.PIECES_PER_PLAYER - 2, ApagosState.PIECES_PER_PLAYER - 1);
    });
    beforeEach(() => {
        rules = new ApagosRules(ApagosState);
        minimaxes = [
            new ApagosDummyMinimax(rules, 'ApagosDummyMinimax'),
        ];
    });
    it('should refuse droping on a full square', () => {
        // given a board with one full square
        const state: ApagosState = stateWithOneFullSquare;
        // when droping on that full square
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.TWO, Player.ONE);
        // then move should be illegal
        const reason: string = ApagosFailure.CANNOT_LAND_ON_A_FULL_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should refuse slide down from a square not containing piece to slide', () => {
        // given the initial board
        const state: ApagosState = ApagosState.getInitialState();
        // when doing a slide down
        const move: ApagosMove = ApagosMove.transfer(ApagosCoord.ONE, ApagosCoord.ZERO).get();
        // then it should not be legal
        const reason: string = ApagosFailure.NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should refuse moving on a full square', () => {
        // given a board with one full square and one piece higher
        const state: ApagosState = ApagosState.fromRepresentation(4, [
            [0, 0, 2, 0],
            [0, 0, 1, 1],
            [7, 5, 3, 1],
        ], ApagosState.PIECES_PER_PLAYER - 2, ApagosState.PIECES_PER_PLAYER - 2);
        // when moving a piece on it
        const move: ApagosMove = ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.TWO).get();
        // then it should not be legal
        const reason: string = ApagosFailure.CANNOT_LAND_ON_A_FULL_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should slide piece down', () => {
        // given a board with a movable piece
        const state: ApagosState = stateWithOneFullSquare;
        // when sliding it
        const move: ApagosMove = ApagosMove.transfer(ApagosCoord.TWO, ApagosCoord.ONE).get();
        // then it should have been moved down
        const expectedState: ApagosState = ApagosState.fromRepresentation(4, [
            [0, 0, 2, 0],
            [0, 1, 0, 0],
            [7, 5, 3, 1],
        ], ApagosState.PIECES_PER_PLAYER - 2, ApagosState.PIECES_PER_PLAYER - 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should refuse to drop when there is no longer enough pieces', () => {
        // given a board with all piece of Player.ZERO on the board
        const state: ApagosState = ApagosState.fromRepresentation(10, [
            [6, 0, 3, 1],
            [0, 0, 0, 0],
            [7, 5, 3, 1],
        ], 0, ApagosState.PIECES_PER_PLAYER);
        // when dropping a Player.ZERO piece
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.ONE, Player.ZERO);
        // then move should be illegal
        const reason: string = ApagosFailure.NO_PIECE_REMAINING_TO_DROP();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should drop piece when on low square', () => {
        // given the initial board
        const state: ApagosState = ApagosState.getInitialState();
        // when droping piece on one of the 3 low squares
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.ONE, Player.ZERO);
        // then the square should climb one place up
        const expectedState: ApagosState = ApagosState.fromRepresentation(1, [
            [0, 0, 1, 0],
            [0, 0, 0, 0],
            [7, 3, 5, 1],
        ], ApagosState.PIECES_PER_PLAYER - 1, ApagosState.PIECES_PER_PLAYER);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should drop piece when on higher square', () => {
        // given the initial board
        const state: ApagosState = ApagosState.getInitialState();
        // when droping piece on one of the 3 low squares
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.THREE, Player.ZERO);
        // then the square should not move
        const expectedState: ApagosState = ApagosState.fromRepresentation(1, [
            [0, 0, 0, 1],
            [0, 0, 0, 0],
            [7, 5, 3, 1],
        ], ApagosState.PIECES_PER_PLAYER - 1, ApagosState.PIECES_PER_PLAYER);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should know who is winning (Player.ZERO)', () => {
        // given a ended part state
        const state: ApagosState = ApagosState.fromRepresentation(20, [
            [7, 0, 0, 1],
            [0, 5, 3, 0],
            [7, 5, 3, 1],
        ], 0, 0);
        // then we should know who won
        const node: ApagosNode = new MGPNode(null, null, state);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('should know who is winning (Player.ONE)', () => {
        // given a ended part state
        const state: ApagosState = ApagosState.fromRepresentation(20, [
            [7, 0, 1, 0],
            [0, 5, 2, 1],
            [7, 5, 3, 1],
        ], 0, 0);
        // then we should know who won
        const node: ApagosNode = new MGPNode(null, null, state);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
});
