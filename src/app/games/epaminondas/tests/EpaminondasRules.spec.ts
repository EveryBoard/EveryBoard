/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/utils/ArrayUtils';
import { Direction } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasLegalityInformation, EpaminondasNode, EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasMinimax } from '../EpaminondasMinimax';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { EpaminondasFailure } from '../EpaminondasFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';
import { AttackEpaminondasMinimax } from '../AttackEpaminondasMinimax';
import { PositionalEpaminondasMinimax } from '../PositionalEpaminondasMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('EpaminondasRules:', () => {

    let rules: EpaminondasRules;
    let minimaxes: Minimax<EpaminondasMove, EpaminondasState, EpaminondasLegalityInformation>[];
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(() => {
        rules = new EpaminondasRules(EpaminondasState);
        minimaxes = [
            new AttackEpaminondasMinimax(rules, 'Attack'),
            new EpaminondasMinimax(rules, 'Epaminondas'),
            new PositionalEpaminondasMinimax(rules, 'Positional'),
        ];
    });
    it('should forbid phalanx to go outside the board (body)', () => {
        // Given a board
        const board: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 0);
        // When trying to move a phalanx outside of the board
        const move: EpaminondasMove = new EpaminondasMove(0, 11, 1, 1, Direction.DOWN);
        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, EpaminondasFailure.PHALANX_IS_LEAVING_BOARD());
    });
    it('should forbid phalanx to go outside the board (head)', () => {
        // Given a board
        const board: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 0);
        // When trying to move a phalanx (but only its head) outside of the board
        const move: EpaminondasMove = new EpaminondasMove(1, 11, 2, 2, Direction.UP_LEFT);
        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, EpaminondasFailure.PHALANX_IS_LEAVING_BOARD());
    });
    it('should forbid invalid phalanx (phalanx containing coord outside the board)', () => {
        // Given a board
        const board: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 0);
        // When trying to move a phalanx that contains pieces outside of the board
        const move: EpaminondasMove = new EpaminondasMove(0, 11, 2, 1, Direction.DOWN);
        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move,
                                     EpaminondasFailure.PHALANX_CANNOT_CONTAIN_PIECES_OUTSIDE_BOARD());
    });
    it('should forbid phalanx to pass through other pieces', () => {
        // Given a board with a phalanx next to an opponent's piece
        const board: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 0);
        // When trying to move over the opponent's piece
        const move: EpaminondasMove = new EpaminondasMove(0, 11, 3, 3, Direction.UP);
        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, EpaminondasFailure.SOMETHING_IN_PHALANX_WAY());
    });
    it('should forbid to capture greater phalanx', () => {
        // Given a board with two phalanx in opposition to each other
        const board: Table<PlayerOrNone> = [
            [_, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [_, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 0);
        // When trying to capture a greater phalanx
        const move: EpaminondasMove = new EpaminondasMove(0, 10, 1, 1, Direction.UP);
        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, EpaminondasFailure.PHALANX_SHOULD_BE_GREATER_TO_CAPTURE());
    });
    it('should forbid to capture same sized phalanx', () => {
        // Given a board with two phalanx of the same size
        const board: Table<PlayerOrNone> = [
            [_, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 0);
        // When trying to capture a phalanx of the same size
        const move: EpaminondasMove = new EpaminondasMove(0, 11, 2, 2, Direction.UP);
        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, EpaminondasFailure.PHALANX_SHOULD_BE_GREATER_TO_CAPTURE());
    });
    it('should forbid to capture your own pieces phalanx', () => {
        // Given a board
        const board: Table<PlayerOrNone> = [
            [_, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 0);
        // When trying to capture one of its own
        const move: EpaminondasMove = new EpaminondasMove(0, 11, 2, 2, Direction.UP);
        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.CANNOT_SELF_CAPTURE());
    });
    it('should forbid moving opponent pieces', () => {
        // Given a board
        const board: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 1);
        // When trying to move a piece of the opponent
        const move: EpaminondasMove = new EpaminondasMove(0, 10, 1, 1, Direction.UP);
        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, EpaminondasFailure.PHALANX_CANNOT_CONTAIN_OPPONENT_PIECE());
    });
    it('should allow legal move', () => {
        // Given a board
        const board: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 0);
        // When performing a legal move
        const move: EpaminondasMove = new EpaminondasMove(0, 11, 2, 2, Direction.UP);
        // Then it should succeed
        const expectedBoard: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [_, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        const expectedState: EpaminondasState = new EpaminondasState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should allow legal capture', () => {
        // Given a board with a possible capture
        const board: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 0);
        // When performing the capture
        const move: EpaminondasMove = new EpaminondasMove(0, 11, 3, 1, Direction.UP);
        // Then it should succeed
        const expectedBoard: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, O, O],
            [_, O, O, O, O, O, O, O, O, O, O, O, O, O],
        ];
        const expectedState: EpaminondasState = new EpaminondasState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    describe('Victories', () => {
        it('should declare first player winner if their pawn survives one turn on last line', () => {
            // Given a board where first player wins
            const board: Table<PlayerOrNone> = [
                [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ];
            const state: EpaminondasState = new EpaminondasState(board, 2);
            const move: EpaminondasMove = new EpaminondasMove(0, 9, 1, 1, Direction.DOWN);
            const node: EpaminondasNode = new EpaminondasNode(state, MGPOptional.empty(), MGPOptional.of(move));
            // Then it should be a victory for 0
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
        it('should declare second player winner if his pawn survive one turn on first line', () => {
            // Given a board where second player wins
            const board: Table<PlayerOrNone> = [
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ];
            const state: EpaminondasState = new EpaminondasState(board, 1);
            const move: EpaminondasMove = new EpaminondasMove(0, 2, 1, 1, Direction.UP);
            const node: EpaminondasNode = new EpaminondasNode(state, MGPOptional.empty(), MGPOptional.of(move));
            // Then it should be a victory for player 1
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
        it('should not consider first player winner if both player have one piece on their landing line', () => {
            // Given a board where both players have a piece on the landing line
            const board: Table<PlayerOrNone> = [
                [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ];
            const state: EpaminondasState = new EpaminondasState(board, 2);
            const move: EpaminondasMove = new EpaminondasMove(0, 10, 1, 1, Direction.DOWN);
            const node: EpaminondasNode = new EpaminondasNode(state, MGPOptional.empty(), MGPOptional.of(move));
            // Then it should not be a win for anyone
            RulesUtils.expectToBeOngoing(rules, node, minimaxes);
        });
        it('should declare player zero winner when last soldier of opponent has been captured', () => {
            // Given a board with only pieces from player zero
            const board: Table<PlayerOrNone> = [
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [O, O, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ];
            const state: EpaminondasState = new EpaminondasState(board, 1);
            const move: EpaminondasMove = new EpaminondasMove(2, 9, 2, 1, Direction.LEFT);
            const node: EpaminondasNode = new EpaminondasNode(state, MGPOptional.empty(), MGPOptional.of(move));
            // Then it should be a win for player zero
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
        it('should declare player one winner when last soldier of opponent has been captured', () => {
            // Given a board with only pieces from player one
            const board: Table<PlayerOrNone> = [
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [X, X, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ];
            const state: EpaminondasState = new EpaminondasState(board, 2);
            const move: EpaminondasMove = new EpaminondasMove(2, 9, 2, 1, Direction.LEFT);
            const node: EpaminondasNode = new EpaminondasNode(state, MGPOptional.empty(), MGPOptional.of(move));
            // Then it should be a win for player one
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
    });
});
