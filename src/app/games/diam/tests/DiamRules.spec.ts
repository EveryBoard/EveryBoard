/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { DiamMove, DiamMoveDrop, DiamMoveShift } from '../DiamMove';
import { DiamPiece } from '../DiamPiece';
import { DiamNode, DiamRules } from '../DiamRules';
import { DiamState } from '../DiamState';
import { Player } from 'src/app/jscaip/Player';
import { DiamFailure } from '../DiamFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('DiamRules', () => {

    const __: DiamPiece = DiamPiece.EMPTY;
    const A1: DiamPiece = DiamPiece.ZERO_FIRST;
    const A2: DiamPiece = DiamPiece.ZERO_SECOND;
    const B1: DiamPiece = DiamPiece.ONE_FIRST;
    const B2: DiamPiece = DiamPiece.ONE_SECOND;

    let rules: DiamRules;
    const defaultConfig: NoConfig = DiamRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = DiamRules.get();
    });

    function drop(target: number, piece: DiamPiece): DiamMove {
        return new DiamMoveDrop(target, piece);
    }

    function shift(start: Coord, direction: 'clockwise' | 'counterclockwise'): DiamMove {
        return DiamMoveShift.ofRepresentation(start, direction);
    }

    describe('drop moves', () => {

        it('should allow a simple drop on the empty board', () => {
            // Given the initial state
            const state: DiamState = DiamRules.get().getInitialState();
            // When dropping a Player.ZERO piece in a valid space
            const move: DiamMove = drop(0, A1);
            // Then the piece goes to the bottom of that space
            // and there is one less piece of that type
            const expectedState: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid dropping a piece from the opponent', () => {
            // Given the initial state
            const state: DiamState = DiamRules.get().getInitialState();

            // When dropping a Player.ONE piece in a valid space
            const move: DiamMove = drop(0, B1);

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid dropping on a space that is full', () => {
            // Given a state where one space is already full
            const state: DiamState = DiamState.ofRepresentation([
                [B1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
                [B1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
            ], 0);

            // When dropping a piece in a full space
            const move: DiamMove = drop(0, A2);
            const reason: string = DiamFailure.SPACE_IS_FULL();

            // Then the move should be illegal
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid dropping a piece that is not remaining', () => {
            // Given a state where the player is out of one of its pieces
            const state: DiamState = DiamState.ofRepresentation([
                [A1, __, B1, __, __, __, __, __],
                [A1, __, B1, __, __, __, __, __],
                [A1, __, B1, __, __, __, __, __],
                [A1, __, B1, __, __, __, __, __],
            ], 0);

            // When dropping a piece that is not remaining
            const move: DiamMove = drop(1, A1);

            // Then the move should be illegal
            const reason: string = DiamFailure.NO_MORE_PIECES_OF_THIS_TYPE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

    });

    describe('shift moves', () => {

        it('should allow moving a stack where the first piece is owned by the player', () => {
            // Given a state where a shift can be made
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [B1, __, __, __, __, __, __, B2],
                [A1, __, __, __, __, __, __, A2],
            ], 4);
            // When moving the stack starting at A2 clockwise
            const move: DiamMove = shift(new Coord(7, 3), 'clockwise');
            // Then the move suceeds and the stack is moved on top of the other one
            const expectedState: DiamState = DiamState.ofRepresentation([
                [B2, __, __, __, __, __, __, __],
                [A2, __, __, __, __, __, __, __],
                [B1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
            ], 5);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow moving from the middle of a stack', () => {
            // Given a state where a shift can be made
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, B2],
                [B1, __, __, __, __, __, __, A2],
            ], 4);

            // When moving the stack starting at A1 counterclockwise
            const move: DiamMove = shift(new Coord(0, 2), 'counterclockwise');

            // Then the move should succeed
            const expectedState: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, A1],
                [__, __, __, __, __, __, __, B2],
                [B1, __, __, __, __, __, __, A2],
            ], 5);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow moving a full stack', () => {
            // Given a state where a shift can be made
            const state: DiamState = DiamState.ofRepresentation([
                [B2, __, __, __, __, __, __, __],
                [A2, __, __, __, __, __, __, __],
                [B1, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
            ], 4);

            // When moving the stack starting at A1 counterclockwise
            const move: DiamMove = shift(new Coord(0, 3), 'counterclockwise');

            // Then the move should succeed
            const expectedState: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, B2],
                [__, __, __, __, __, __, __, A2],
                [__, __, __, __, __, __, __, B1],
                [__, __, __, __, __, __, __, A1],
            ], 5);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid moving a substack if its lowest piece is not owned by the player', () => {
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, A1],
                [B1, __, __, __, __, __, __, B2],
                [A1, __, __, __, __, __, __, A2],
            ], 4);

            // When moving the stack starting at B2 clockwise
            const move: DiamMove = shift(new Coord(7, 2), 'clockwise');

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving a stack if the receiving space will become too high', () => {
            // Given a state where a shift would result in a too high stack
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, A1],
                [B1, __, __, __, __, __, __, B2],
                [A1, __, __, __, __, __, __, A2],
            ], 4);

            // When moving the stack starting at A2 clockwise
            const move: DiamMove = shift(new Coord(7, 3), 'clockwise');

            // Then the move should be illegal
            const reason: string = DiamFailure.TARGET_STACK_TOO_HIGH();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving a stack if it does not exist', () => {
            // Given a state where no shifts are possible
            const state: DiamState = DiamRules.get().getInitialState();

            // When moving a non-existing stack
            const move: DiamMove = shift(new Coord(0, 1), 'clockwise');

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

    });

    describe('winning configurations', () => {

        it('should not consider ground alignment as win', () => {
            // Given a state where there is an alignment on the first level
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, __, __, __, __],
                [B1, __, __, __, B1, __, __, __],
            ], 3);
            const node: DiamNode = new DiamNode(state);
            // Then it should be considered as ongoing
            RulesUtils.expectToBeOngoing(rules, node, defaultConfig);
        });

        it('should not consider non-facing alignment as win', () => {
            // Given a state where there is an alignment but not face-to-face
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [A1, A1, __, __, __, __, __, __],
                [B1, B2, __, __, __, __, __, __],
            ], 4);
            const node: DiamNode = new DiamNode(state);
            // Then it should be considered as ongoing
            RulesUtils.expectToBeOngoing(rules, node, defaultConfig);
        });

        it('should detect player 0 win with face-to-face alignment', () => {
            // Given a state where player zero has a face-to-face alignment
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [__, __, __, __, __, __, __, __],
                [A1, __, __, __, A1, __, __, __],
                [B1, __, __, __, B2, __, __, __],
            ], 4);
            const node: DiamNode = new DiamNode(state);
            // Then it is detected as a v ictory for player zero
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it('should detect win when two alignments happen at the same turn', () => {
            // Given a board where two alignment exist, but player one has a higher alignment
            const state: DiamState = DiamState.ofRepresentation([
                [__, __, __, __, __, __, __, __],
                [B2, __, __, __, B2, __, __, __],
                [A1, __, __, __, A1, __, __, __],
                [B1, __, __, __, B2, __, __, __],
            ], 4);
            const node: DiamNode = new DiamNode(state);
            // Then the winner is the one with the highest alignment
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

    });

});
