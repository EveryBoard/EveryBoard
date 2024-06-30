/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { Table } from 'src/app/jscaip/TableUtils';
import { MGPMap, MGPOptional, TestUtils, Utils } from '@everyboard/lib';
import { MartianChessMove, MartianChessMoveFailure } from '../MartianChessMove';
import { MartianChessNode, MartianChessRules } from '../MartianChessRules';
import { MartianChessFailure } from '../MartianChessFailure';
import { MartianChessCapture, MartianChessState } from '../MartianChessState';
import { MartianChessPiece } from '../MartianChessPiece';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('MartianChessRules', () => {

    const _: MartianChessPiece = MartianChessPiece.EMPTY;
    const A: MartianChessPiece = MartianChessPiece.PAWN;
    const B: MartianChessPiece = MartianChessPiece.DRONE;
    const C: MartianChessPiece = MartianChessPiece.QUEEN;

    const capturedPawn: MartianChessCapture = MartianChessCapture.of([A]);
    const noCapture: MartianChessCapture = MartianChessCapture.of([]);

    let rules: MartianChessRules;
    const defaultConfig: NoConfig = MartianChessRules.get().getDefaultRulesConfig();

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
        rules = MartianChessRules.get();
    });

    it('should be illegal to choose a piece in the opponent territory', () => {
        // Given any board
        const state: MartianChessState = MartianChessRules.get().getInitialState();

        // When choosing a piece in the opponent's territory
        const move: MartianChessMove = MartianChessMove.from(new Coord(2, 2), new Coord(3, 3)).get();

        // Then the move should be illegal
        const reason: string = MartianChessFailure.MUST_CHOOSE_PIECE_FROM_YOUR_TERRITORY();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should be illegal to choose an empty square', () => {
        // Given any board
        const state: MartianChessState = MartianChessRules.get().getInitialState();

        // When choosing an empty square
        const move: MartianChessMove = MartianChessMove.from(new Coord(0, 4), new Coord(0, 3)).get();

        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should be illegal to move a pawn not on one of the 4 diagonal neighbors', () => {
        // Given any board
        const state: MartianChessState = MartianChessRules.get().getInitialState();

        // When moving one of your pawn vertically
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 5), new Coord(1, 4)).get();

        // Then the move should be illegal
        const reason: string = MartianChessMoveFailure.PAWN_MUST_MOVE_ONE_DIAGONAL_STEP();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should be illegal to land a drone more than two orthogonal step', () => {
        // Given any board
        const state: MartianChessState = MartianChessRules.get().getInitialState();

        // When moving a drone three orthogonal step
        const move: MartianChessMove = MartianChessMove.from(new Coord(3, 5), new Coord(3, 2)).get();

        // Then the move should be illegal
        const reason: string = MartianChessMoveFailure.DRONE_MUST_DO_TWO_ORTHOGONAL_STEPS();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should be illegal to jump over another piece with a queen (aligned move)', () => {
        // Given any board
        const state: MartianChessState = MartianChessRules.get().getInitialState();

        // When moving a queen over another piece
        const move: MartianChessMove = MartianChessMove.from(new Coord(3, 7), new Coord(3, 2)).get();

        // Then the move should be illegal
        const reason: string = RulesFailure.SOMETHING_IN_THE_WAY();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should be illegal to land on your own pieces', () => {
        // Given any board
        const state: MartianChessState = MartianChessRules.get().getInitialState();

        // When landing your piece on one of your piece, when no promotion are possible
        const move: MartianChessMove = MartianChessMove.from(new Coord(2, 6), new Coord(1, 5)).get();

        // Then the move should be illegal
        const reason: string = MartianChessFailure.CANNOT_CAPTURE_YOUR_OWN_PIECE_NOR_PROMOTE_IT();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should be illegal to move a pawn like a bishop for further than one step', () => {
        // Given the initial board
        const state: MartianChessState = MartianChessRules.get().getInitialState();

        // When moving diagonally of two step one pawn
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 5), new Coord(3, 3)).get();

        // Then the move should be illegal
        const reason: string = MartianChessMoveFailure.PAWN_MUST_MOVE_ONE_DIAGONAL_STEP();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should be legal to move a pawn on one of the 4 diagonal neighbors', () => {
        // Given the initial board
        const state: MartianChessState = MartianChessRules.get().getInitialState();

        // When moving diagonally of one step one pawn
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 5), new Coord(0, 4)).get();

        // Then the move should succeed and the board changed
        const expectedBoard: Table<MartianChessPiece> = [
            [C, C, B, _],
            [C, B, A, _],
            [B, A, A, _],
            [_, _, _, _],
            [A, _, _, _],
            [_, _, A, B],
            [_, A, B, C],
            [_, B, C, C],
        ];
        const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should be legal to move a drone of one orthogonal steps', () => {
        // Given the initial board
        const state: MartianChessState = MartianChessRules.get().getInitialState();

        // When moving horizontally of one step one drone
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(0, 7)).get();

        // Then the move should succeed and the board changed
        const expectedBoard: Table<MartianChessPiece> = [
            [C, C, B, _],
            [C, B, A, _],
            [B, A, A, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, A, A, B],
            [_, A, B, C],
            [B, _, C, C],
        ];
        const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should be legal to move a drone of two orthogonals steps', () => {
        // Given the initial board
        const board: Table<MartianChessPiece> = [
            [C, C, B, _],
            [C, B, A, _],
            [B, A, A, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, A, A, B],
            [_, A, B, C],
            [B, _, C, C],
        ];
        const state: MartianChessState = new MartianChessState(board, 0);

        // When moving vertically of two step one drone
        const move: MartianChessMove = MartianChessMove.from(new Coord(0, 7), new Coord(0, 5)).get();

        // Then the move should succeed and the board changed
        const expectedBoard: Table<MartianChessPiece> = [
            [C, C, B, _],
            [C, B, A, _],
            [B, A, A, _],
            [_, _, _, _],
            [_, _, _, _],
            [B, A, A, B],
            [_, A, B, C],
            [_, _, C, C],
        ];
        const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
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
        const state: MartianChessState = new MartianChessState(board, 1);

        // When moving a drone of one diagonal step
        const move: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(1, 1)).get();

        // Then the move should succeed
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
        const expectedState: MartianChessState = new MartianChessState(expectedBoard, 2, MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should be legal to move a drone of two diagonal steps', () => {
        // Given any board
        const state: MartianChessState = MartianChessRules.get().getInitialState();

        // When moving a drone of two diagonal steps
        const move: MartianChessMove = MartianChessMove.from(new Coord(3, 5), new Coord(1, 3)).get();

        // Then the move should succeed
        const expectedBoard: Table<MartianChessPiece> = [
            [C, C, B, _],
            [C, B, A, _],
            [B, A, A, _],
            [_, B, _, _],
            [_, _, _, _],
            [_, A, A, _],
            [_, A, B, C],
            [_, B, C, C],
        ];
        const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
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
        const state: MartianChessState = new MartianChessState(board, 1);

        // When moving queen a long line
        const move: MartianChessMove = MartianChessMove.from(new Coord(0, 0), new Coord(0, 7)).get();

        // Then the move should succeed and the board changed
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
        const expectedState: MartianChessState = new MartianChessState(expectedBoard, 2, MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should add score when capturing first time', () => {
        // Given a board where a capture can be done
        const state: MartianChessState = new MartianChessState(boardWhereCaptureCanBeDone, 1);

        // When doing this capture
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 3), new Coord(2, 4)).get();

        // Then the captured piece should have been added
        const captured: MGPMap<Player, MartianChessCapture> = new MGPMap<Player, MartianChessCapture>();
        captured.set(Player.ZERO, noCapture);
        captured.set(Player.ONE, capturedPawn);
        const expectedState: MartianChessState = new MartianChessState(expectedBoardAfterCapture,
                                                                       2,
                                                                       MGPOptional.of(move),
                                                                       MGPOptional.empty(),
                                                                       captured);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    it('should add score when capturing again', () => {
        // Given a board where a capture can be done again
        const capturedBefore: MGPMap<Player, MartianChessCapture> = new MGPMap<Player, MartianChessCapture>();
        capturedBefore.set(Player.ZERO, noCapture);
        capturedBefore.set(Player.ONE, capturedPawn);
        const state: MartianChessState = new MartianChessState(boardWhereCaptureCanBeDone,
                                                               1,
                                                               MGPOptional.empty(),
                                                               MGPOptional.empty(),
                                                               capturedBefore);
        // When doing this capture
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 3), new Coord(2, 4)).get();

        // Then the captured piece should have been added
        const captured: MGPMap<Player, MartianChessCapture> = new MGPMap<Player, MartianChessCapture>();
        const capturedPawns: MartianChessCapture = MartianChessCapture.of([A, A]);
        captured.set(Player.ZERO, noCapture);
        captured.set(Player.ONE, capturedPawns);
        const expectedState: MartianChessState = new MartianChessState(expectedBoardAfterCapture,
                                                                       2,
                                                                       MGPOptional.of(move),
                                                                       MGPOptional.empty(),
                                                                       captured);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    describe('Undo last move', () => {

        it('should remember last move in state', () => {
            // Given a board
            const state: MartianChessState = MartianChessRules.get().getInitialState();

            // When moving a piece
            const move: MartianChessMove = MartianChessMove.from(new Coord(1, 5), new Coord(0, 4)).get();

            // Then the move should succeed and saved in the state
            const expectedBoard: Table<MartianChessPiece> = [
                [C, C, B, _],
                [C, B, A, _],
                [B, A, A, _],
                [_, _, _, _],
                [A, _, _, _],
                [_, _, A, B],
                [_, A, B, C],
                [_, B, C, C],
            ];
            const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid to put the last moved piece right where it was', () => {
            // Given a board on which last move was A -> B
            const a: Coord = new Coord(3, 3);
            const b: Coord = new Coord(3, 5);
            const lastMove: MartianChessMove = MartianChessMove.from(a, b).get();
            const board: Table<MartianChessPiece> = MartianChessRules.get().getInitialState().board;
            const state: MartianChessState = new MartianChessState(board, 0, MGPOptional.of(lastMove));

            // When trying to move B -> A
            const move: MartianChessMove = MartianChessMove.from(b, a).get();

            // Then the move should be illegal
            const reason: string = MartianChessFailure.CANNOT_UNDO_LAST_MOVE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid to put the last moved piece right where it was even if calling the clock', () => {
            // Given a board on which last move was A -> B
            const a: Coord = new Coord(3, 3);
            const b: Coord = new Coord(3, 5);
            const lastMove: MartianChessMove = MartianChessMove.from(a, b).get();
            const board: Table<MartianChessPiece> = MartianChessRules.get().getInitialState().board;
            const state: MartianChessState = new MartianChessState(board, 0, MGPOptional.of(lastMove));

            // When trying to move B -> A, call the clock
            const move: MartianChessMove = MartianChessMove.from(b, a, true).get();

            // Then the move should be illegal
            const reason: string = MartianChessFailure.CANNOT_UNDO_LAST_MOVE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
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
            const state: MartianChessState = new MartianChessState(board, 2);

            // When moving a pawn on a drone
            const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(2, 6)).get();

            // Then the move should succeed and a queen created
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
            const expectedState: MartianChessState = new MartianChessState(expectedBoard, 3, MGPOptional.of(move));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
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
            const state: MartianChessState = new MartianChessState(board, 2);

            // When moving a pawn on a drone
            const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(2, 6)).get();

            // Then the move should succeed and a queen created
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
            const expectedState: MartianChessState = new MartianChessState(expectedBoard, 3, MGPOptional.of(move));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
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
            const state: MartianChessState = new MartianChessState(board, 2);

            // When moving a pawn on a drone
            const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(2, 6)).get();

            // Then the move should succeed and a queen created
            const reason: string = MartianChessFailure.CANNOT_CAPTURE_YOUR_OWN_PIECE_NOR_PROMOTE_IT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
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
            const state: MartianChessState = new MartianChessState(board, 2);

            // When moving a pawn on another
            const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(2, 6)).get();

            // Then the move should succeed and a queen created
            const reason: string = MartianChessFailure.CANNOT_CAPTURE_YOUR_OWN_PIECE_NOR_PROMOTE_IT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

    });

    describe('end game', () => {

        describe('empty territory end', () => {

            it('should declare winner player with biggest score when one player put its last piece in the opponent territory (Player.ONE)', () => {
                // Given a board with only one piece in the current player territory
                // and one player having a superior score
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
                const captured: MGPMap<Player, MartianChessCapture> = new MGPMap<Player, MartianChessCapture>();
                captured.set(Player.ZERO, noCapture);
                captured.set(Player.ONE, capturedPawn);
                const state: MartianChessState = new MartianChessState(board,
                                                                       3,
                                                                       MGPOptional.empty(),
                                                                       MGPOptional.empty(),
                                                                       captured);

                // When moving the last piece out of your territory
                const move: MartianChessMove = MartianChessMove.from(new Coord(1, 0), new Coord(1, 7)).get();

                // Then the move should succeed and a queen captured
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
                                                                               4,
                                                                               MGPOptional.of(move),
                                                                               MGPOptional.empty(),
                                                                               captured);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
                const node: MartianChessNode = new MartianChessNode(expectedState);
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
            });

            it('should declare winner player with biggest score when one player put its last piece in the opponent territory (Player.ZERO)', () => {
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
                const captured: MGPMap<Player, MartianChessCapture> = new MGPMap<Player, MartianChessCapture>();
                captured.set(Player.ZERO, capturedPawn);
                captured.set(Player.ONE, noCapture);
                const state: MartianChessState = new MartianChessState(board,
                                                                       2,
                                                                       MGPOptional.empty(),
                                                                       MGPOptional.empty(),
                                                                       captured);
                // When moving the last piece out of your territory
                const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(1, 0)).get();

                // Then the move should succeed and a queen captured
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
                                                                               3,
                                                                               MGPOptional.of(move),
                                                                               MGPOptional.empty(),
                                                                               captured);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
                const node: MartianChessNode = new MartianChessNode(expectedState);
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
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
                const state: MartianChessState = new MartianChessState(board, 1);

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
                const expectedState: MartianChessState = new MartianChessState(expectedBoard, 2, MGPOptional.of(move));
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
                const node: MartianChessNode = new MartianChessNode(expectedState);
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
            });

        });

        describe('call the clock end', () => {

            it('should be legal to "call the clock" during your turn', () => {
                // Given the initial board
                const state: MartianChessState = MartianChessRules.get().getInitialState();

                // When calling the clock
                const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(0, 7), true).get();

                // Then the move should succeed and a queen created
                const expectedBoard: Table<MartianChessPiece> = [
                    [C, C, B, _],
                    [C, B, A, _],
                    [B, A, A, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, A, A, B],
                    [_, A, B, C],
                    [B, _, C, C],
                ];
                const expectedState: MartianChessState = new MartianChessState(expectedBoard,
                                                                               1,
                                                                               MGPOptional.of(move),
                                                                               MartianChessRules.STARTING_COUNT_DOWN);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

            it('should not be allowed to call it again on a clock-started state', () => {
                // Given a board with clock called
                const board: Table<MartianChessPiece> = MartianChessRules.get().getInitialState().getCopiedBoard();
                const state: MartianChessState = new MartianChessState(board,
                                                                       0,
                                                                       MGPOptional.empty(),
                                                                       MartianChessRules.STARTING_COUNT_DOWN);
                spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

                // When calling the clock once more
                const move: MartianChessMove = MartianChessMove.from(new Coord(1, 7), new Coord(0, 6), true).get();

                // Then the move should throw, as is it not an expected move
                const expectedBoard: Table<MartianChessPiece> = [
                    [C, C, B, _],
                    [C, B, A, _],
                    [B, A, A, _],
                    [_, _, _, _],
                    [_, _, _, _],
                    [_, A, A, B],
                    [B, A, B, C],
                    [_, _, C, C],
                ];
                const expectedState: MartianChessState = new MartianChessState(expectedBoard, 1, MGPOptional.of(move));
                const reason: string = 'Should not call the clock twice';
                TestUtils.expectToThrowAndLog(() => {
                    RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
                }, reason);
            });

            it('should decrease clock-count-down each captureless-turn when clock was called', () => {
                // Given a board with clock called
                const board: Table<MartianChessPiece> = MartianChessRules.get().getInitialState().getCopiedBoard();
                const state: MartianChessState = new MartianChessState(board,
                                                                       1,
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
                                                                               2,
                                                                               MGPOptional.of(move),
                                                                               MGPOptional.of(6));
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
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
                                                                       1,
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
                captured.replace(Player.ONE, capturedPawn);
                const expectedState: MartianChessState = new MartianChessState(expectedBoard,
                                                                               2,
                                                                               MGPOptional.of(move),
                                                                               MartianChessRules.STARTING_COUNT_DOWN,
                                                                               captured);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

            it('should end the game when 7 moves passed since clock called, and declare biggest score winner (zero)', () => {
                // Given a board with clock about to time out
                const initialState: MartianChessState = MartianChessRules.get().getInitialState();
                const board: Table<MartianChessPiece> = initialState.getCopiedBoard();
                const captured: MGPMap<Player, MartianChessCapture> = initialState.captured.getCopy();
                captured.replace(Player.ZERO, capturedPawn);
                const state: MartianChessState = new MartianChessState(board,
                                                                       1,
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
                                                                               2,
                                                                               MGPOptional.of(move),
                                                                               MGPOptional.of(0),
                                                                               captured);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
                const node: MartianChessNode = new MartianChessNode(expectedState);
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
            });

            it('should end the game when 7 moves passed since clock called, and declare biggest score winner (one)', () => {
                // Given a board with clock about to time out
                const initialState: MartianChessState = MartianChessRules.get().getInitialState();
                const board: Table<MartianChessPiece> = initialState.getCopiedBoard();
                const captured: MGPMap<Player, MartianChessCapture> = initialState.captured.getCopy();
                captured.replace(Player.ONE, capturedPawn);
                const state: MartianChessState = new MartianChessState(board,
                                                                       1,
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
                                                                               2,
                                                                               MGPOptional.of(move),
                                                                               MGPOptional.of(0),
                                                                               captured);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
                const node: MartianChessNode = new MartianChessNode(expectedState);
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
            });

            it('should end the game when 7 moves passed since clock called, and declare draw if score are equal', () => {
                // Given a board with clock about to time out
                const initialState: MartianChessState = MartianChessRules.get().getInitialState();
                const board: Table<MartianChessPiece> = initialState.getCopiedBoard();
                const state: MartianChessState = new MartianChessState(board,
                                                                       1,
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
                                                                               2,
                                                                               MGPOptional.of(move),
                                                                               MGPOptional.of(0));
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
                const node: MartianChessNode = new MartianChessNode(expectedState);
                RulesUtils.expectToBeDraw(rules, node, defaultConfig);
            });

        });

    });

});
