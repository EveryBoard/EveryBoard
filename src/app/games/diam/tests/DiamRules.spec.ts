import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { DiamMove, DiamMoveDrop, DiamMoveShift } from '../DiamMove';
import { DiamPiece } from '../DiamPiece';
import { DiamNode, DiamRules } from '../DiamRules';
import { DiamState } from '../DiamState';
import { Player } from 'src/app/jscaip/Player';
import { DiamDummyMinimax } from '../DiamDummyMinimax';
import { DiamFailure } from '../DiamFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';

describe('DiamRules', () => {
    const __: DiamPiece = DiamPiece.EMPTY;
    const A1: DiamPiece = DiamPiece.ZERO_FIRST;
    const A2: DiamPiece = DiamPiece.ZERO_SECOND;
    const B1: DiamPiece = DiamPiece.ONE_FIRST;
    const B2: DiamPiece = DiamPiece.ONE_SECOND;

    let rules: DiamRules;

    let minimaxes: Minimax<DiamMove, DiamState>[];

    beforeEach(() => {
        rules = new DiamRules(DiamState);
        minimaxes = [
            new DiamDummyMinimax(rules, 'DiamDummyMinimax'),
        ];
    });

    describe('drop moves', () => {
        it('should allow a simple drop on the empty board', () => {
            // given the initial state
            const state: DiamState = DiamState.getInitialState();
            // when dropping a Player.ZERO piece in a valid space
            const move: DiamMove = new DiamMoveDrop(0, A1);
            // then the piece goes to the bottom of that space
            // and there is one less piece of that type
            const expectedState: DiamState = new DiamState([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
            ], [3, 4, 4, 4], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should forbid dropping a piece from the opponent', () => {
            // given the initial state
            const state: DiamState = DiamState.getInitialState();
            // when dropping a Player.ONE piece in a valid space
            const move: DiamMove = new DiamMoveDrop(0, B1);
            // then the move is illegal
            RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        });
        it('should forbid dropping on a space that is full', () => {
            // given a state where one space is already full
            const state: DiamState = new DiamState([
                [B1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
                [B1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
            ], [2, 4, 2, 4], 0);
            // when dropping a piece in a full space
            const move: DiamMove = new DiamMoveDrop(0, A2);
            // then the move is illegal
            RulesUtils.expectMoveFailure(rules, state, move, DiamFailure.STACK_IS_FULL());
        });
        it('should forbid dropping a piece that is not remaining', () => {
            // given a state where the player is out of one of its pieces
            const state: DiamState = new DiamState([
                [A1, __, B1, __, __, __, __, __],
                [A1, __, B1, __, __, __, __, __],
                [A1, __, B1, __, __, __, __, __],
                [A1, __, B1, __, __, __, __, __],
            ], [0, 4, 0, 4], 0);
            // when dropping a piece that is not remaining
            const move: DiamMove = new DiamMoveDrop(1, A1);
            // then the move is illegal
            RulesUtils.expectMoveFailure(rules, state, move, DiamFailure.NO_MORE_PIECES_OF_THIS_TYPE());
        });
    });
    describe('shift moves', () => {
        it('should allow moving a stack where the first piece is owned by the player', () => {
            // given a state where a shift can be made
            const state: DiamState = new DiamState([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [B1, __, __, __, __, __, __, B2],
                [A1, __, __, __, __, __, __, A2],
            ], [3, 3, 3, 3], 4);
            // when moving the stack starting at A2 to the right
            const move: DiamMove = new DiamMoveShift(new Coord(7, 3), 'right');
            // then the move suceeds and the stack is moved on top of the other one
            const expectedState: DiamState = new DiamState([
                [B2, __, __, __, __, __, __, __],
                [A2, __, __, __, __, __, __, __],
                [B1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
            ], [3, 3, 3, 3], 5);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should allow moving from the middle of a stack', () => {
            // given a state where a shift can be made
            const state: DiamState = new DiamState([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, B2],
                [B1, __, __, __, __, __, __, A2],
            ], [3, 3, 3, 3], 4);
            // when moving the stack starting at A1 to the left
            const move: DiamMove = new DiamMoveShift(new Coord(0, 2), 'left');
            // then the move is legal
            const expectedState: DiamState = new DiamState([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, A1],
                [__, __, __, __, __, __, __, B2],
                [B1, __, __, __, __, __, __, A2],
            ], [3, 3, 3, 3], 5);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should allow moving a full stack', () => {
            // given a state where a shift can be made
            const state: DiamState = new DiamState([
                [B2, __, __, __, __, __, __, __],
                [A2, __, __, __, __, __, __, __],
                [B1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
            ], [3, 3, 3, 3], 4);
            // when moving the stack starting at A1 to the left
            const move: DiamMove = new DiamMoveShift(new Coord(0, 3), 'left');
            // then the move is legal
            const expectedState: DiamState = new DiamState([
                [__, __, __, __, __, __, __, B2],
                [__, __, __, __, __, __, __, A2],
                [__, __, __, __, __, __, __, B1],
                [__, __, __, __, __, __, __, A1],
            ], [3, 3, 3, 3], 5);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should forbid moving a stack if the first piece is not owned by the player', () => {
            const state: DiamState = new DiamState([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, A1],
                [B1, __, __, __, __, __, __, B2],
                [A1, __, __, __, __, __, __, A2],
            ], [2, 3, 3, 3], 4);
            // when moving the stack starting at B2 to the right
            const move: DiamMove = new DiamMoveShift(new Coord(7, 2), 'right');
            // then the move is not legal
            RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        });
        it('should forbid moving a stack if the receiving space will become too high', () => {
            // given a state where a shift would result in a too high stack
            const state: DiamState = new DiamState([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, A1],
                [B1, __, __, __, __, __, __, B2],
                [A1, __, __, __, __, __, __, A2],
            ], [2, 3, 3, 3], 4);
            // when moving the stack starting at A2 to the right
            const move: DiamMove = new DiamMoveShift(new Coord(7, 3), 'right');
            // then the move is not legal
            RulesUtils.expectMoveFailure(rules, state, move, DiamFailure.TARGET_STACK_TOO_HIGH());
        });
        it('should forbid moving a stack if it does not exist', () => {
            // given a state where no shifts are possible
            const state: DiamState = DiamState.getInitialState();
            // when moving a non-existing stack
            const move: DiamMove = new DiamMoveShift(new Coord(0, 1), 'right');
            // then the move is not legal
            RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        });
    });
    describe('winning configurations', () => {
        it('should not consider ground alignment as win', () => {
            // given a state where there is an alignment on the first level
            const state: DiamState = new DiamState([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
                [B1, __, __, __, B1, __, __, __],
            ], [3, 4, 2, 4], 3);
            const node: DiamNode = new DiamNode(null, null, state);
            // then the game is still ongoing
            RulesUtils.expectToBeOngoing(rules, node, minimaxes);
        });
        it('should not consider non-facing alignment as win', () => {
            // given a state where there is an alignment but not face-to-face
            const state: DiamState = new DiamState([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [A1, A1, __, __, __, __, __, __],
                [B1, B2, __, __, __, __, __, __],
            ], [2, 4, 3, 3], 4);
            const node: DiamNode = new DiamNode(null, null, state);
            // then the game is still ongoing
            RulesUtils.expectToBeOngoing(rules, node, minimaxes);
        });
        it('should detect player 0 win with face-to-face alignment', () => {
            // given a state where player zero has a face-to-face alignment
            const state: DiamState = new DiamState([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, A1, __, __, __],
                [B1, __, __, __, B2, __, __, __],
            ], [2, 4, 3, 3], 4);
            const node: DiamNode = new DiamNode(null, null, state);
            // then it is detected as a v ictory for player zero
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
        it('should detect win when two alignments happen in the same turn', () => {
            // given a board where two alignment exist, but player one has a higher alignment
            const state: DiamState = new DiamState([
                [__, __, __, __, __, __, __, __],
                [B2, __, __, __, B2, __, __, __],
                [A1, __, __, __, A1, __, __, __],
                [B1, __, __, __, B2, __, __, __],
            ], [2, 4, 3, 1], 4);
            const node: DiamNode = new DiamNode(null, null, state);
            // then the winner is the one with the highest alignment
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
    });
});
