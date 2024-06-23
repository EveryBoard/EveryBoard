/* eslint-disable max-lines-per-function */
import { MGPOptional, TestUtils } from '@everyboard/lib';
import { Player } from 'src/app/jscaip/Player';
import { HexagonalConnectionConfig, HexagonalConnectionNode, HexagonalConnectionRules } from '../HexagonalConnectionRules';
import { HexagonalConnectionState } from '../HexagonalConnectionState';
import { HexagonalConnectionMove } from '../HexagonalConnectionMove';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { DodecaHexaDirection } from 'src/app/jscaip/DodecaHexaDirection';

describe('HexagonalConnectionRules', () => {
    /**
     * Naming of cases, some of them will be used
     * A. double open: _ _ X X X X _ _
     * B. open: O _ X X X X _ O
     * C. cross-open: O _ X X X X _ _
     * D. closed: O X X X X _ O
     */
    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const N: FourStatePiece = FourStatePiece.UNREACHABLE;

    let rules: HexagonalConnectionRules;
    const defaultConfig: MGPOptional<HexagonalConnectionConfig> =
        HexagonalConnectionRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = HexagonalConnectionRules.get();
    });

    describe('first turn', () => {

        it('should not create move when coord is out of board', () => {
            // Given the initial state
            const state: HexagonalConnectionState = HexagonalConnectionRules.get().getInitialState(defaultConfig);

            // When dropping out of the board
            const move: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(-1, -1)]);

            // Then it should be illegal
            const reason: string = CoordFailure.OUT_OF_RANGE(new Coord(-1, -1));
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow the first player play only one piece', () => {
            // Given the initial state
            const state: HexagonalConnectionState = HexagonalConnectionRules.get().getInitialState(defaultConfig);

            // When dropping one piece
            const move: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(6, 6)]);

            // Then the move should be a success
            const expectedState: HexagonalConnectionState = new HexagonalConnectionState([
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [_, _, _, _, _, _, _, _, N, N, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N, N, N],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should refuse move that drops two pieces on first turn', () => {
            // Given the first turn
            const state: HexagonalConnectionState = HexagonalConnectionRules.get().getInitialState(defaultConfig);
            // When dropping two pieces
            const move: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(11, 11), new Coord(10, 10)]);
            // Then the attempt would have throw
            function tryDoubleDropOnFirstTurn(): void {
                rules.isLegal(move, state, defaultConfig);
            }
            TestUtils.expectToThrowAndLog(tryDoubleDropOnFirstTurn, 'HexagonalConnectionMove should only drop one piece at first turn');
        });

    });

    describe('next turns', () => {

        it('should forbid move where second coord is out of range', () => {
            // Given any board on second turn
            const state: HexagonalConnectionState = new HexagonalConnectionState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);

            // When doing a move who'se second coord is out of range
            const move: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(0, 0), new Coord(-1, -1)]);

            // Then it should fail
            const reason: string = CoordFailure.OUT_OF_RANGE(new Coord(-1, -1));
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid move where first coord is out of range', () => {
            // Given any board on second turn
            const state: HexagonalConnectionState = new HexagonalConnectionState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);

            // When doing a move who'se second coord is out of range
            const move: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(-2, -2), new Coord(0, 0)]);

            // Then it should fail
            const reason: string = CoordFailure.OUT_OF_RANGE(new Coord(-2, -2));
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should refuse dropping first coord on another piece', () => {
            // Given a board with pieces on it
            const state: HexagonalConnectionState = new HexagonalConnectionState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);

            // When dropping piece on it with the first coord already occupied
            const move: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(9, 9), new Coord(10, 10)]);

            const reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE();
            // Then it should fail
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should refuse dropping second coord on another piece', () => {
            // Given a board with pieces on it
            const state: HexagonalConnectionState = new HexagonalConnectionState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);

            // When dropping piece on it with the second coord already occupied
            const move: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(8, 8), new Coord(9, 9)]);

            // Then it should fail
            const reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow move that drop two pieces on empty pieces', () => {
            // Given a board with pieces on it
            const state: HexagonalConnectionState = new HexagonalConnectionState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);

            // When dropping pieces on empty squares
            const move: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(7, 7), new Coord(8, 8)]);
            const expectedState: HexagonalConnectionState = new HexagonalConnectionState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 2);

            // Then it should succeed
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should refuse dropping only one piece after first turn', () => {
            // Given a board that is not first turn
            const state: HexagonalConnectionState = new HexagonalConnectionState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);
            // When dropping only one piece
            const move: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(9, 9)]);

            // Then it should fail
            function trySingleDropAfterFirstTurn(): void {
                rules.isLegal(move, state, defaultConfig);
            }
            TestUtils.expectToThrowAndLog(trySingleDropAfterFirstTurn, 'HexagonalConnectionMove should have exactly 2 drops (got 1)');
        });

        it('should notify victory when aligning 6 stones of your color', () => {
            const state: HexagonalConnectionState = new HexagonalConnectionState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, X, X, X, X, X, X, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, X, O, O, O, O, O, X, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 8);
            const node: HexagonalConnectionNode = new HexagonalConnectionNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

        it('should draw when no one can play anymore', () => {
            // Given the wildly unlikely case in which in 180 turn no one win
            const state: HexagonalConnectionState = new HexagonalConnectionState([
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [O, O, O, O, O, X, X, X, X, X, O, O, O, O, O, X, X, X, X],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [O, O, O, O, O, X, X, X, X, X, O, O, O, O, O, X, X, X, X],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [O, O, O, O, O, X, X, X, X, X, O, O, O, O, O, X, X, X, X],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, O, X, O, X, O, X, O, X, O, X, O, X, O, X, O, X, _, _],
            ], 180);

            // When playing the last 181st turn
            const move: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(17, 18), new Coord(18, 18)]);
            const expectedState: HexagonalConnectionState = new HexagonalConnectionState([
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [O, O, O, O, O, X, X, X, X, X, O, O, O, O, O, X, X, X, X],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [O, O, O, O, O, X, X, X, X, X, O, O, O, O, O, X, X, X, X],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [O, O, O, O, O, X, X, X, X, X, O, O, O, O, O, X, X, X, X],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, X, X, X, X, O, O, O, O, O, X, X, X, X, X, O, O, O, O],
                [X, O, X, O, X, O, X, O, X, O, X, O, X, O, X, O, X, O, O],
            ], 181);

            // Then the board should be a draw
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: HexagonalConnectionNode = new HexagonalConnectionNode(expectedState);
            RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        });

        it('should include the diagonals', () => {
            // Given a board where the square alignement
            // (the line that looks like an alignement on that square board but that is not on an hexagonal board)
            const state: HexagonalConnectionState = new HexagonalConnectionState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 1);
            const node: HexagonalConnectionNode = new HexagonalConnectionNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

    });

    describe('victory', () => {

        for (const dir of DodecaHexaDirection.factory.all) {
            it('should include alignment of ' + dir.toString(), () => {
                // Given a board with 6 pieces aligned in <dir> direction
                const largeConfig: MGPOptional<HexagonalConnectionConfig> = MGPOptional.of({
                    ...defaultConfig.get(),
                    size: 12,
                });
                const center: Coord = new Coord(12, 12);
                let state: HexagonalConnectionState = rules
                    .getInitialState(largeConfig)
                    .setPieceAt(center, FourStatePiece.ZERO)
                    .incrementTurn();
                for (let distance: number = 1; distance <= 6; distance++) {
                    state = state.setPieceAt(center.getNext(dir, distance), FourStatePiece.ONE);
                }
                state = state.incrementTurn();
                const node: HexagonalConnectionNode = new HexagonalConnectionNode(state);

                // When evaluating its board status
                // Then it should be a victory
                RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, largeConfig);
            });
        }

    });

});
