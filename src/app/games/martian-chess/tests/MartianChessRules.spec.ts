/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MartianChessDummyMinimax } from '../MartianChessDummyMinimax';
import { MartianChessMove, MartianChessMoveFailure } from '../MartianChessMove';
import { MartianChessMoveResult, MartianChessNode, MartianChessRules, MartianChessRulesFailure } from '../MartianChessRules';
import { MartianChessCapture, MartianChessState } from '../MartianChessState';
import { MartianChessPiece } from '../MartianChessPiece';

describe('MartianChessRules', () => {

    const _: MartianChessPiece = MartianChessPiece.EMPTY;
    const A: MartianChessPiece = MartianChessPiece.PAWN;
    const B: MartianChessPiece = MartianChessPiece.DRONE;
    const C: MartianChessPiece = MartianChessPiece.QUEEN;

    const capturedPawn: MartianChessCapture = MartianChessCapture.from([A]);
    const noCapture: MartianChessCapture = MartianChessCapture.from([]);

    let rules: MartianChessRules;

    let minimaxes: Minimax<MartianChessMove, MartianChessState, MartianChessMoveResult>[];

    const boardWhereCaptureCanBeDone: Table<MartianChessPiece> = [
        [A, _, _, _],
        [_, _, _, _],
        [_, _, _, _],
        [_, A, _, _],
        [_, _, A, _],
        [_, _, _, _],
        [_, _, _, _],
        [_, _, _, A],
    ];
    const expectedBoardAfterCapture: Table<MartianChessPiece> = [
        [A, _, _, _],
        [_, _, _, _],
        [_, _, _, _],
        [_, _, _, _],
        [_, _, A, _],
        [_, _, _, _],
        [_, _, _, _],
        [_, _, _, A],
    ];

    beforeEach(() => {
        rules = new MartianChessRules(MartianChessState);
        minimaxes = [
            new MartianChessDummyMinimax(rules, 'MartianChessDummyMinimax'),
        ];
    });
    it('Should be illegal to choose a piece in the opponent territory', () => {
        // Given any board
        const state: MartianChessState = MartianChessState.getInitialState();

        // When choosing a piece in the opponent's territory
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 5), new Coord(0, 4)).get();

        // Then the move should be illegal
        const reason: string = MartianChessRulesFailure.MUST_CHOOSE_PIECE_FROM_YOUR_TERRITORY();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to choose an empty square', () => {
        // Given any board
        const state: MartianChessState = MartianChessState.getInitialState();

        // When choosing an empty square
        const move: MartianChessMove = MartianChessMove.from(new Coord(3, 3), new Coord(3, 4)).get();

        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to move a pawn not on one of the 4 diagonal neighboor', () => {
        // Given any board
        const state: MartianChessState = MartianChessState.getInitialState();

        // When moving one of your pawn vertically
        const move: MartianChessMove = MartianChessMove.from(new Coord(2, 2), new Coord(2, 3)).get();

        // Then the move should be illegal
        const reason: string = MartianChessMoveFailure.PAWN_MUST_MOVE_ONE_DIAGONAL_STEP();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to land a drone more than two orthogonal step', () => {
        // Given any board
        const state: MartianChessState = MartianChessState.getInitialState();

        // When moving a drone three orthogonal step
        const move: MartianChessMove = MartianChessMove.from(new Coord(0, 2), new Coord(0, 5)).get();

        // Then the move should be illegal
        const reason: string = MartianChessMoveFailure.DRONE_MUST_DO_TWO_ORTHOGONAL_STEPS();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to jump over another piece with a queen (aligned move)', () => {
        // Given any board
        const state: MartianChessState = MartianChessState.getInitialState();

        // When moving a queen over another piece
        const move: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(0, 5)).get();

        // Then the move should be illegal
        const reason: string = RulesFailure.SOMETHING_IN_THE_WAY();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to land on your own pieces', () => {
        // Given any board
        const state: MartianChessState = MartianChessState.getInitialState();

        // When landing your piece on one of your piece, when no promotion are possible
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 1), new Coord(2, 2)).get();

        // Then the move should be illegal
        const reason: string = MartianChessRulesFailure.CANNOT_CAPTURE_YOUR_OWN_PIECE_NOR_PROMOTE_IT();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to move a pawn like a bishop for further than one step', () => {
        // Given the initial board
        const state: MartianChessState = MartianChessState.getInitialState();

        // When moving diagonally of two step one pawn
        const move: MartianChessMove = MartianChessMove.from(new Coord(2, 2), new Coord(0, 4)).get();

        // Then the move should be illegal
        const reason: string = MartianChessMoveFailure.PAWN_MUST_MOVE_ONE_DIAGONAL_STEP();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be legal to move a pawn on one of the 4 diagonal neighboor', () => {
        // Given the initial board
        const state: MartianChessState = MartianChessState.getInitialState();

        // When moving diagonally of one step one pawn
        const move: MartianChessMove = MartianChessMove.from(new Coord(2, 2), new Coord(3, 3)).get();

        // Then the move should be legal and the board changed
        const expectedBoard: Table<MartianChessPiece> = [
            [C, C, B, _],
            [C, B, A, _],
            [B, A, _, _],
            [_, _, _, A],
            [_, _, _, _],
            [_, A, A, B],
            [_, A, B, C],
            [_, B, C, C],
        ];
        const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should be legal to move a drone of two orthogonal steps', () => {
        // Given the initial board
        const state: MartianChessState = MartianChessState.getInitialState();

        // When moving diagonally of one step one pawn
        const move: MartianChessMove = MartianChessMove.from(new Coord(2, 2), new Coord(3, 3)).get();

        // Then the move should be legal and the board changed
        const expectedBoard: Table<MartianChessPiece> = [
            [C, C, B, _],
            [C, B, A, _],
            [B, A, _, _],
            [_, _, _, A],
            [_, _, _, _],
            [_, A, A, B],
            [_, A, B, C],
            [_, B, C, C],
        ];
        const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should be legal to move a drone of one diagonal step', () => {
        // Given any board
        const board: Table<MartianChessPiece> = [
            [B, A, _, _],
            [A, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, A, _],
            [_, _, _, _],
        ];
        const state: MartianChessState = new MartianChessState(board, 0);

        // When moving a drone of one diagonal step
        const move: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(1, 1)).get();

        // Then the move should be legal
        const expectedBoard: Table<MartianChessPiece> = [
            [_, A, _, _],
            [A, B, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, A, _],
            [_, _, _, _],
        ];
        const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should be legal to move a drone of two diagonal steps', () => {
        // Given any board
        const state: MartianChessState = MartianChessState.getInitialState();

        // When moving a drone of two diagonal steps
        const move: MartianChessMove = MartianChessMove.from(new Coord(0, 2), new Coord(2, 4)).get();

        // Then the move should be legal
        const expectedBoard: Table<MartianChessPiece> = [
            [C, C, B, _],
            [C, B, A, _],
            [_, A, A, _],
            [_, _, _, _],
            [_, _, B, _],
            [_, A, A, B],
            [_, A, B, C],
            [_, B, C, C],
        ];
        const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should be legal to move a queen as far as you want linearly', () => {
        // Given a board where a queen is free to move
        const board: Table<MartianChessPiece> = [
            [C, C, B, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, A, A, B],
            [_, A, B, C],
            [_, B, C, C],
        ];
        const state: MartianChessState = new MartianChessState(board, 0);

        // When moving queen a long line
        const move: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(0, 7)).get();

        // Then the move should be legal and the board changed
        const expectedBoard: Table<MartianChessPiece> = [
            [_, C, B, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, A, A, B],
            [_, A, B, C],
            [C, B, C, C],
        ];
        const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should add score when capturing first time', () => {
        // Given a board where a capture can be done
        const state: MartianChessState = new MartianChessState(boardWhereCaptureCanBeDone, 0);

        // When doing this capture
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 3), new Coord(2, 4)).get();

        // Then the captured piece should have been added
        const captured: MGPMap<Player, MartianChessCapture> = new MGPMap<Player, MartianChessCapture>();
        captured.set(Player.ZERO, capturedPawn);
        captured.set(Player.ONE, noCapture);
        const expectedState: MartianChessState = new MartianChessState(expectedBoardAfterCapture,
                                                                       1,
                                                                       MGPOptional.of(move),
                                                                       MGPOptional.empty(),
                                                                       captured);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should add score when capturing again', () => {
        // Given a board where a capture can be done again
        const capturedBefore: MGPMap<Player, MartianChessCapture> = new MGPMap<Player, MartianChessCapture>();
        capturedBefore.set(Player.ZERO, capturedPawn);
        capturedBefore.set(Player.ONE, noCapture);
        const state: MartianChessState = new MartianChessState(boardWhereCaptureCanBeDone,
                                                               0,
                                                               MGPOptional.empty(),
                                                               MGPOptional.empty(),
                                                               capturedBefore);
        // When doing this capture
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 3), new Coord(2, 4)).get();

        // Then the captured piece should have been added
        const captured: MGPMap<Player, MartianChessCapture> = new MGPMap<Player, MartianChessCapture>();
        const capturedPawns: MartianChessCapture = MartianChessCapture.from([A, A]);
        captured.set(Player.ZERO, capturedPawns);
        captured.set(Player.ONE, noCapture);
        const expectedState: MartianChessState = new MartianChessState(expectedBoardAfterCapture,
                                                                       1,
                                                                       MGPOptional.of(move),
                                                                       MGPOptional.empty(),
                                                                       captured);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    describe('Undo last move', () => {
        it('should remember last move in state', () => {
            // Given a board
            const state: MartianChessState = MartianChessState.getInitialState();

            // When moving a piece
            const move: MartianChessMove = MartianChessMove.from(new Coord(2, 2), new Coord(3, 3)).get();

            // Then the move should be saved in the state
            const expectedBoard: Table<MartianChessPiece> = [
                [C, C, B, _],
                [C, B, A, _],
                [B, A, _, _],
                [_, _, _, A],
                [_, _, _, _],
                [_, A, A, B],
                [_, A, B, C],
                [_, B, C, C],
            ];
            const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should forbid to put the last moved piece right where it was', () => {
            // Given a board on which last move was A -> B
            const a: Coord = new Coord(0, 4);
            const b: Coord = new Coord(0, 2);
            const lastMove: MartianChessMove = MartianChessMove.from(a, b).get();
            const board: Table<MartianChessPiece> = MartianChessState.getInitialState().board;
            const state: MartianChessState = new MartianChessState(board, 0, MGPOptional.of(lastMove));

            // When trying to move B -> A
            const move: MartianChessMove = MartianChessMove.from(b, a).get();

            // Then it should be deemed illegal
            const reason: string = MartianChessRulesFailure.CANNOT_UNDO_LAST_MOVE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid to put the last moved piece right where it was even if calling the clock', () => {
            // Given a board on which last move was A -> B
            const a: Coord = new Coord(0, 4);
            const b: Coord = new Coord(0, 2);
            const lastMove: MartianChessMove = MartianChessMove.from(a, b).get();
            const board: Table<MartianChessPiece> = MartianChessState.getInitialState().board;
            const state: MartianChessState = new MartianChessState(board, 0, MGPOptional.of(lastMove));

            // When trying to move B -> A, call the clock
            const move: MartianChessMove = MartianChessMove.from(b, a, true).get();

            // Then it should be deemed illegal
            const reason: string = MartianChessRulesFailure.CANNOT_UNDO_LAST_MOVE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
    });
    describe('field promotion', () => {
        it('should be legal to merge one pawn and one drone in one queen when no queen present', () => {
            // Given a board where one pawn and one drone are neighbor and have no queen on their side of the board
            const board: Table<MartianChessPiece> = [
                [A, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, B, _],
                [_, A, _, _],
            ];
            const state: MartianChessState = new MartianChessState(board, 1);

            // When moving a pawn on a drone
            const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(2, 6)).get();

            // Then the move should be legal and a queen created
            const expectedBoard: Table<MartianChessPiece> = [
                [A, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, C, _],
                [_, _, _, _],
            ];
            const expectedState: MartianChessState = new MartianChessState(expectedBoard, 2, MGPOptional.of(move));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should be legal to merge two pawns in drone when no drone present', () => {
            // Given a board where two pawns are neighbors and have no drone on their side of the board
            const board: Table<MartianChessPiece> = [
                [A, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, A, _],
                [_, A, _, _],
            ];
            const state: MartianChessState = new MartianChessState(board, 1);

            // When moving a pawn on a drone
            const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(2, 6)).get();

            // Then the move should be legal and a queen created
            const expectedBoard: Table<MartianChessPiece> = [
                [A, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, B, _],
                [_, _, _, _],
            ];
            const expectedState: MartianChessState = new MartianChessState(expectedBoard, 2, MGPOptional.of(move));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should be illegal to merge one pawn and one drone in one queen when a queen is present', () => {
            // Given a board with queen on the board, a pawn and a drone being neibhors
            const board: Table<MartianChessPiece> = [
                [A, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, B, C],
                [_, A, _, _],
            ];
            const state: MartianChessState = new MartianChessState(board, 1);

            // When moving a pawn on a drone
            const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(2, 6)).get();

            // Then the move should be legal and a queen created
            const reason: string = MartianChessRulesFailure.CANNOT_CAPTURE_YOUR_OWN_PIECE_NOR_PROMOTE_IT();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should be illegal to merge two pawns in a drone when a drone is present', () => {
            // Given a with two neighbor pawns with a drone on their half of the board
            const board: Table<MartianChessPiece> = [
                [A, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, A, B],
                [_, A, _, _],
            ];
            const state: MartianChessState = new MartianChessState(board, 1);

            // When moving a pawn on another
            const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(2, 6)).get();

            // Then the move should be legal and a queen created
            const reason: string = MartianChessRulesFailure.CANNOT_CAPTURE_YOUR_OWN_PIECE_NOR_PROMOTE_IT();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
    });
    describe('end game', () => {
        describe('empty territory end', () => {
            it('should declare winner player with biggest score when one player put its last piece in the opponent territory (Player.ZERO)', () => {
                // Given a board with only one piece in the current player territory
                const board: Table<MartianChessPiece> = [
                    [_, C, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [C, _, B, _],
                ];
                const state: MartianChessState = new MartianChessState(board, 2);

                // When moving the last piece out of your territory
                const move: MartianChessMove = MartianChessMove.from(new Coord(1, 0), new Coord(1, 7)).get();

                // Then the move should be legal and a queen captured
                const expectedBoard: Table<MartianChessPiece> = [
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [C, C, B, _],
                ];
                const expectedState: MartianChessState = new MartianChessState(expectedBoard,
                                                                               3,
                                                                               MGPOptional.of(move),
                                                                               MGPOptional.empty());
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: MartianChessNode = new MartianChessNode(expectedState);
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
            });
            it('should declare winner player with biggest score when one player put its last piece in the opponent territory (Player.ONE)', () => {
                // Given a board with only one piece in the current player territory
                const board: Table<MartianChessPiece> = [
                    [C, _, B, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, C, _, _],
                ];
                const state: MartianChessState = new MartianChessState(board, 1);

                // When moving the last piece out of your territory
                const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(1, 0)).get();

                // Then the move should be legal and a queen captured
                const expectedBoard: Table<MartianChessPiece> = [
                    [C, C, B, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                ];
                const expectedState: MartianChessState = new MartianChessState(expectedBoard,
                                                                               2,
                                                                               MGPOptional.of(move),
                                                                               MGPOptional.empty());
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: MartianChessNode = new MartianChessNode(expectedState);
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
            it('should declare winner last player when one player put its last piece in the opponent territory and score are equal', () => {
                // Given a board with only one piece in the current player territory
                const board: Table<MartianChessPiece> = [
                    [C, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, C],
                ];
                const state: MartianChessState = new MartianChessState(board, 0);

                // When moving the last piece out of your territory
                const move: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(0, 4)).get();

                // Then the game should be ended and Player.ZERO the winner
                const expectedBoard: Table<MartianChessPiece> = [
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [C, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, C],
                ];
                const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: MartianChessNode = new MartianChessNode(expectedState);
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
            });
        });
        describe('call the clock end', () => {
            it('should be legal to "call the clock" during your turn', () => {
                // Given the initial board
                const state: MartianChessState = MartianChessState.getInitialState();

                // When calling the clock
                const move: MartianChessMove = MartianChessMove.from(new Coord(2, 0), new Coord(3, 0), true).get();

                // Then the move should be legal and a queen created
                const expectedBoard: Table<MartianChessPiece> = [
                    [C, C, _, B],
                    [C, B, A, _],
                    [B, A, A, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, A, A, B],
                    [_, A, B, C],
                    [_, B, C, C],
                ];
                const expectedState: MartianChessState = new MartianChessState(expectedBoard,
                                                                               1,
                                                                               MGPOptional.of(move),
                                                                               MartianChessRules.STARTING_COUNT_DOWN);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            });
            it('should be "asked to dev" not to call it again on a clock-started state', () => {
                // Given a board with clock called
                const board: Table<MartianChessPiece> = MartianChessState.getInitialState().getCopiedBoard();
                const state: MartianChessState = new MartianChessState(board,
                                                                       0,
                                                                       MGPOptional.empty(),
                                                                       MartianChessRules.STARTING_COUNT_DOWN);
                spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

                // When calling the clock once more
                const move: MartianChessMove = MartianChessMove.from(new Coord(2, 0), new Coord(3, 1), true).get();

                // Then the move should throw, cause dev should not do that
                const expectedBoard: Table<MartianChessPiece> = [
                    [C, C, _, _],
                    [C, B, A, B],
                    [B, A, A, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, A, A, B],
                    [_, A, B, C],
                    [_, B, C, C],
                ];
                const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
                const component: string = 'Assertion failure';
                const error: string = 'Should not call the clock twice';
                expect(() => RulesUtils.expectMoveSuccess(rules, state, move, expectedState)).toThrowError(component + ': ' + error);
                expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith(component, error);
            });
            it('should decrease clock-count-down each captureless-turn when clock was called', () => {
                // Given a board with clock called
                const board: Table<MartianChessPiece> = MartianChessState.getInitialState().getCopiedBoard();
                const state: MartianChessState = new MartianChessState(board,
                                                                       0,
                                                                       MGPOptional.empty(),
                                                                       MartianChessRules.STARTING_COUNT_DOWN);

                // When doing a move
                const move: MartianChessMove = MartianChessMove.from(new Coord(2, 1), new Coord(3, 0)).get();

                // Then the count down should ... be counting down !
                const expectedBoard: Table<MartianChessPiece> = [
                    [C, C, B, A],
                    [C, B, _, _],
                    [B, A, A, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, A, A, B],
                    [_, A, B, C],
                    [_, B, C, C],
                ];
                const expectedState: MartianChessState = new MartianChessState(expectedBoard,
                                                                               1,
                                                                               MGPOptional.of(move),
                                                                               MGPOptional.of(6));
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            });
            it('should reset clock countdown when a capture occurs', () => {
                // Given a board with clock called
                const board: Table<MartianChessPiece> = [
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, A, B, C],
                    [_, _, _, _],
                    [_, A, B, A],
                    [_, _, _, _],
                    [_, _, _, _],
                ];
                const state: MartianChessState = new MartianChessState(board,
                                                                       0,
                                                                       MGPOptional.empty(),
                                                                       MGPOptional.of(3));

                // When doing a move
                const move: MartianChessMove = MartianChessMove.from(new Coord(3, 3), new Coord(3, 5)).get();

                // Then the count down should ... be counting down !
                const expectedBoard: Table<MartianChessPiece> = [
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, A, B, _],
                    [_, _, _, _],
                    [_, A, B, C],
                    [_, _, _, _],
                    [_, _, _, _],
                ];
                const captured: MGPMap<Player, MartianChessCapture> = state.captured.getCopy();
                captured.replace(Player.ZERO, capturedPawn);
                const expectedState: MartianChessState = new MartianChessState(expectedBoard,
                                                                               1,
                                                                               MGPOptional.of(move),
                                                                               MartianChessRules.STARTING_COUNT_DOWN,
                                                                               captured);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            });
            it('should end the game when 7 moves passed since clock called, and declare biggest score winner (zero)', () => {
                // Given a board with clock about to time out
                const initialState: MartianChessState = MartianChessState.getInitialState();
                const board: Table<MartianChessPiece> = initialState.getCopiedBoard();
                const captured: MGPMap<Player, MartianChessCapture> = initialState.captured.getCopy();
                captured.replace(Player.ZERO, capturedPawn);
                const state: MartianChessState = new MartianChessState(board,
                                                                       0,
                                                                       MGPOptional.empty(),
                                                                       MGPOptional.of(1),
                                                                       captured);

                // When doing the last move
                const move: MartianChessMove = MartianChessMove.from(new Coord(2, 1), new Coord(3, 2)).get();

                // Then the count down should reach zero and the game should have ended; Zero winning 1-0
                const expectedBoard: Table<MartianChessPiece> = [
                    [C, C, B, _],
                    [C, B, _, _],
                    [B, A, A, A],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, A, A, B],
                    [_, A, B, C],
                    [_, B, C, C],
                ];
                const expectedState: MartianChessState = new MartianChessState(expectedBoard,
                                                                               1,
                                                                               MGPOptional.of(move),
                                                                               MGPOptional.of(0),
                                                                               captured);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: MartianChessNode = new MartianChessNode(expectedState);
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
            });
            it('should end the game when 7 moves passed since clock called, and declare biggest score winner (one)', () => {
                // Given a board with clock about to time out
                const initialState: MartianChessState = MartianChessState.getInitialState();
                const board: Table<MartianChessPiece> = initialState.getCopiedBoard();
                const captured: MGPMap<Player, MartianChessCapture> = initialState.captured.getCopy();
                captured.replace(Player.ONE, capturedPawn);
                const state: MartianChessState = new MartianChessState(board,
                                                                       0,
                                                                       MGPOptional.empty(),
                                                                       MGPOptional.of(1),
                                                                       captured);

                // When doing the last move
                const move: MartianChessMove = MartianChessMove.from(new Coord(2, 2), new Coord(3, 1)).get();

                // Then the count down should reach zero and the game should have ended; One winning 1-0
                const expectedBoard: Table<MartianChessPiece> = [
                    [C, C, B, _],
                    [C, B, A, A],
                    [B, A, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, A, A, B],
                    [_, A, B, C],
                    [_, B, C, C],
                ];
                const expectedState: MartianChessState = new MartianChessState(expectedBoard,
                                                                               1,
                                                                               MGPOptional.of(move),
                                                                               MGPOptional.of(0),
                                                                               captured);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: MartianChessNode = new MartianChessNode(expectedState);
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
            });
            it('should end the game when 7 moves passed since clock called, and declare draw if score are equal', () => {
                // Given a board with clock about to time out
                const initialState: MartianChessState = MartianChessState.getInitialState();
                const board: Table<MartianChessPiece> = initialState.getCopiedBoard();
                const state: MartianChessState = new MartianChessState(board,
                                                                       0,
                                                                       MGPOptional.empty(),
                                                                       MGPOptional.of(1));

                // When doing the last move
                const move: MartianChessMove = MartianChessMove.from(new Coord(2, 2), new Coord(3, 3)).get();

                // Then the count down should reach zero and game should be a draw
                const expectedBoard: Table<MartianChessPiece> = [
                    [C, C, B, _],
                    [C, B, A, _],
                    [B, A, _, _],
                    [_, _, _, A],
                    [_, _, _, _],
                    [_, A, A, B],
                    [_, A, B, C],
                    [_, B, C, C],
                ];
                const expectedState: MartianChessState = new MartianChessState(expectedBoard,
                                                                               1,
                                                                               MGPOptional.of(move),
                                                                               MGPOptional.of(0));
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
                const node: MartianChessNode = new MartianChessNode(expectedState);
                RulesUtils.expectToBeDraw(rules, node, minimaxes);
            });
        });
    });
});
