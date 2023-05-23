/* eslint-disable max-lines-per-function */
import { QuartoNode, QuartoRules } from '../QuartoRules';
import { QuartoMinimax } from '../QuartoMinimax';
import { QuartoMove } from '../QuartoMove';
import { QuartoPiece } from '../QuartoPiece';
import { QuartoState } from '../QuartoState';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Table } from 'src/app/utils/ArrayUtils';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { Minimax } from 'src/app/jscaip/Minimax';
import { QuartoFailure } from '../QuartoFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('QuartoRules', () => {

    let rules: QuartoRules;
    let minimaxes: Minimax<QuartoMove, QuartoState>[];

    beforeEach(() => {
        rules = QuartoRules.get();
        minimaxes = [
            new QuartoMinimax(rules, 'QuartoMinimax'),
        ];
    });
    it('should create', () => {
        expect(rules).toBeTruthy();
    });
    it('should forbid not to give a piece when not last turn', () => {
        // Given a board that is not on last turn
        const state: QuartoState = QuartoState.getInitialState();

        // When giving no piece to next player
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.EMPTY);

        // Then the move should be juged illegal
        const reason: string = 'You must give a piece.';
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should allow not to give a piece on last turn, and consider the game a draw if no one win', () => {
        // Given a board on last turn
        const board: Table<QuartoPiece> = [
            [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
            [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
            [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
            [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 15, QuartoPiece.BAAB);

        // When giving no piece
        const move: QuartoMove = new QuartoMove(3, 3, QuartoPiece.EMPTY);

        // Then the move should be deemed legal
        const expectedBoard: Table<QuartoPiece> = [
            [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
            [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
            [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
            [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.BAAB],
        ];
        const expectedState: QuartoState = new QuartoState(expectedBoard, 16, QuartoPiece.EMPTY);
        const node: QuartoNode = new MGPNode(expectedState);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeDraw(rules, node, minimaxes);
    });
    it('should forbid to give a piece already on the board', () => {
        // Given a board with AAAA on it
        const board: Table<QuartoPiece> = [
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.AAAA, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 1, QuartoPiece.AABA);

        // When giving AAAA to next player
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAA);

        // Then the move should be illegal
        const reason: string = QuartoFailure.PIECE_ALREADY_ON_BOARD();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should forbid to give the piece that you had in your hand', () => {
        // Given any board
        const state: QuartoState = QuartoState.getInitialState();

        // When giving the piece you had in hand
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAA);

        // Then the move should be deemed illegal
        const reason: string = QuartoFailure.CANNOT_GIVE_PIECE_IN_HAND();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should forbid to play on occupied square', () => {
        // Given a board with occupied square
        const board: Table<QuartoPiece> = [
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.AAAA, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 1, QuartoPiece.AABA);

        // When playing on another square
        const move: QuartoMove = new QuartoMove(0, 3, QuartoPiece.BBAA);

        // Then the move should be deemed illegal
        const reason: string = RulesFailure.MUST_LAND_ON_EMPTY_SPACE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should allow simple move', () => {
        // Given a board
        const state: QuartoState = QuartoState.getInitialState();

        // When doing a simple move
        const move: QuartoMove = new QuartoMove(2, 2, QuartoPiece.AAAB);

        // Then the move should be deemed legal
        const expectedBoard: Table<QuartoPiece> = [
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.AAAA, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
        ];
        const expectedState: QuartoState = new QuartoState(expectedBoard, 1, QuartoPiece.AAAB);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should consider Player.ZERO winner when doing a full line', () => {
        // Given a board with 3 piece aligned with common criterion
        const board: Table<QuartoPiece> = [
            [QuartoPiece.BBBB, QuartoPiece.BBBA, QuartoPiece.BBAB, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.AAAA, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 4, QuartoPiece.BBAA);

        // When aligning a fourth one
        const move: QuartoMove = new QuartoMove(3, 0, QuartoPiece.AAAB);

        // Then the game should be a victory for Player.ZERO
        const expectedBoard: Table<QuartoPiece> = [
            [QuartoPiece.BBBB, QuartoPiece.BBBA, QuartoPiece.BBAB, QuartoPiece.BBAA],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.AAAA, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
        ];
        const expectedState: QuartoState = new QuartoState(expectedBoard, 5, QuartoPiece.AAAB);
        const node: QuartoNode = new QuartoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));

        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('should consider Player.ONE winner when doing a full line', () => {
        // Given a board with 3 piece with common criterion aligned
        const board: Table<QuartoPiece> = [
            [QuartoPiece.ABAB, QuartoPiece.EMPTY, QuartoPiece.AABB, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.AAAB, QuartoPiece.BABB, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.AAAA, QuartoPiece.BBAA, QuartoPiece.BBBA],
            [QuartoPiece.ABBB, QuartoPiece.EMPTY, QuartoPiece.BAAB, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 9, QuartoPiece.BBAB);

        // When aligning a fourth one
        const move: QuartoMove = new QuartoMove(3, 3, QuartoPiece.AABA);

        // Then it should be a victory for Player.ONE
        const expectedBoard: Table<QuartoPiece> = [
            [QuartoPiece.ABAB, QuartoPiece.EMPTY, QuartoPiece.AABB, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.AAAB, QuartoPiece.BABB, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.AAAA, QuartoPiece.BBAA, QuartoPiece.BBBA],
            [QuartoPiece.ABBB, QuartoPiece.EMPTY, QuartoPiece.BAAB, QuartoPiece.BBAB],
        ];
        const expectedState: QuartoState = new QuartoState(expectedBoard, 10, QuartoPiece.AABA);
        const node: QuartoNode = new QuartoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));

        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('should recognize ongoing games', () => {
        // Given an ongoing game
        const board: Table<QuartoPiece> = [
            [QuartoPiece.AAAA, QuartoPiece.ABBB, QuartoPiece.ABBB, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.BBBB],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.AAAB],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.AAAB],
        ];
        const state: QuartoState = new QuartoState(board, 9, QuartoPiece.BAAA);
        const node: QuartoNode = new MGPNode(state);

        // When evaluating board value
        // Then it should be considered as ongoing
        RulesUtils.expectToBeOngoing(rules, node, minimaxes);
    });
    describe('updateBoardStatus', () => {
        it('should recognize "3 3" as pre-victory', () => {
            // Given a board where 3 piece are aligned with a common criterion
            // and another line of 3 matching another criterion
            const board: Table<QuartoPiece> = [
                [QuartoPiece.AAAA, QuartoPiece.ABBB, QuartoPiece.AAAB, QuartoPiece.EMPTY],
                [QuartoPiece.BBBB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.EMPTY],
                [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            ];
            const state: QuartoState = new QuartoState(board, 10, QuartoPiece.BBBB);

            // When evaluating board value
            // Then it should be evaluated as Ongoing
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            RulesUtils.expectStateToBePreVictory(state, move, Player.ZERO, minimaxes);
        });
    });
});
