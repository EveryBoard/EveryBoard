/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { Player } from '../../../../jscaip/Player';
import { PlayerNumberMap } from '../../../../jscaip/PlayerMap';
import { Table } from '../../../../jscaip/TableUtils';
import { RulesUtils } from '../../../../jscaip/tests/RulesUtils.spec';
import { GoNode } from '../../AbstractGoRules';
import { GoFailure } from '../../GoFailure';
import { GoMove } from '../../GoMove';
import { GoPhase } from '../../GoPhase';
import { GoPiece } from '../../GoPiece';
import { GoState } from '../../GoState';
import { HexagonalGoConfig, HexagonalGoRules } from '../HexagonalGoRules';

describe('HexagonalGoRules', () => {

    let rules: HexagonalGoRules;

    const X: GoPiece = GoPiece.LIGHT;
    const O: GoPiece = GoPiece.DARK;
    const k: GoPiece = GoPiece.DEAD_LIGHT;
    const u: GoPiece = GoPiece.DEAD_DARK;
    const w: GoPiece = GoPiece.LIGHT_TERRITORY;
    const b: GoPiece = GoPiece.DARK_TERRITORY;
    const _: GoPiece = GoPiece.EMPTY;
    const N: GoPiece = GoPiece.UNREACHABLE;
    const defaultConfig: MGPOptional<HexagonalGoConfig> = HexagonalGoRules.get().getDefaultRulesConfig();

    const noCaptures: PlayerNumberMap = PlayerNumberMap.of(0, 0);

    beforeEach(() => {
        rules = HexagonalGoRules.get();
    });

    it('should be created', () => {
        expect(rules).toBeTruthy();
    });

    describe('GoPhase.PLAYING', () => {

        it('should always be GameStatus.ONGOING', () => {
            // Given starting board
            const state: GoState = HexagonalGoRules.get().getInitialState(defaultConfig);
            const node: GoNode = new GoNode(state);

            // When evaluating it
            // Then it should be considered as ongoing
            RulesUtils.expectToBeOngoing(rules, node, defaultConfig);
        });

        it('should allow simple capture in down-left corner', () => {
            // Given board with a piece in the corner (hence, one freedom)
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, _, _, _, _, _, _, N, N, N, N, N],
                [X, _, _, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, noCaptures, 4, MGPOptional.empty(), GoPhase.PLAYING);

            // When doing the capture
            const move: GoMove = new GoMove(1, 12);

            // Then the move should be considered legal
            const expectedBoard: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, _, _, _, _, _, _, N, N, N, N, N],
                [_, O, _, _, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: GoState = new GoState(expectedBoard,
                                                       PlayerNumberMap.of(1, 0),
                                                       5,
                                                       MGPOptional.empty(),
                                                       GoPhase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow simple capture on low-right edge', () => {
            // Given board with a piece on the edge
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, X, _, N, N],
                [_, _, _, _, _, _, _, _, X, O, N, N, N],
                [_, _, _, _, _, _, _, _, X, N, N, N, N],
                [_, _, _, _, _, _, _, _, N, N, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, noCaptures, 1, MGPOptional.empty(), GoPhase.PLAYING);

            // When doing the capture
            const move: GoMove = new GoMove(10, 8);

            // Then the move should be considered legal
            const expectedBoard: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, X, X, N, N],
                [_, _, _, _, _, _, _, _, X, _, N, N, N],
                [_, _, _, _, _, _, _, _, X, N, N, N, N],
                [_, _, _, _, _, _, _, _, N, N, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: GoState = new GoState(expectedBoard,
                                                       PlayerNumberMap.of(0, 1),
                                                       2,
                                                       MGPOptional.empty(),
                                                       GoPhase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow complex capture', () => {
            // Given a board where several pieces can be captured
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, X, X, _, N, N, N, N],
                [_, _, _, _, _, X, O, O, N, N, N, N, N],
                [_, _, _, _, _, X, O, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, noCaptures, 1, MGPOptional.empty(), GoPhase.PLAYING);

            // When playing on their last freedom
            const move: GoMove = new GoMove(8, 10);

            // Then the move should succeed and capture the pieces
            const expectedBoard: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, X, X, X, N, N, N, N],
                [_, _, _, _, _, X, _, _, N, N, N, N, N],
                [_, _, _, _, _, X, _, N, N, N, N, N, N],
            ];
            const expectedState: GoState = new GoState(expectedBoard,
                                                       PlayerNumberMap.of(0, 3),
                                                       2,
                                                       MGPOptional.empty(),
                                                       GoPhase.PLAYING);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('capture via-fake-suicide should be legal', () => {
            // Given a board with a possible capture
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, O, O, O, _, _, _, _, _],
                [N, N, _, _, O, X, X, O, _, _, _, _, _],
                [N, _, _, O, X, O, X, O, _, _, _, _, _],
                [_, _, _, O, X, _, O, _, _, _, _, _, _],
                [_, _, _, O, O, O, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [_, _, _, _, _, _, _, _, N, N, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, noCaptures, 1, MGPOptional.empty(), GoPhase.PLAYING);

            // When playing in the 0 freedom coord that captures a group
            const move: GoMove = new GoMove(5, 6);

            // Then the move should succeed
            const expectedBoard: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, O, O, O, _, _, _, _, _],
                [N, N, _, _, O, X, X, O, _, _, _, _, _],
                [N, _, _, O, X, _, X, O, _, _, _, _, _],
                [_, _, _, O, X, X, O, _, _, _, _, _, _],
                [_, _, _, O, O, O, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [_, _, _, _, _, _, _, _, N, N, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: GoState =
                new GoState(expectedBoard, PlayerNumberMap.of(0, 1), 2, MGPOptional.empty(), GoPhase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('initial state should be on playing phase', () => {
            // Given initial board
            const state: GoState = HexagonalGoRules.get().getInitialState(defaultConfig);

            // When fetching its phase
            const phase: GoPhase = state.phase;

            // Then it should be playing phase
            expect(phase).toBe(GoPhase.PLAYING);
        });

        it('GoPhase.PLAYING + GoMove.PASS = GoPhase.PASSED', () => {
            // Given initial board (so, playing phase)
            const state: GoState = HexagonalGoRules.get().getInitialState(defaultConfig);

            // When passing
            const move: GoMove = GoMove.PASS;

            // Then we should be in passed phase
            const expectedState: GoState = new GoState(state.board,
                                                       noCaptures,
                                                       1,
                                                       MGPOptional.empty(),
                                                       GoPhase.PASSED);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid accepting', () => {
            // Given a board in playing phase
            const state: GoState = rules.getInitialState(defaultConfig);

            // When accepting
            const move: GoMove = GoMove.ACCEPT;

            // Then the move should be illegal
            const reason: string = GoFailure.CANNOT_ACCEPT_BEFORE_COUNTING_PHASE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('superposition should be illegal in playing phase', () => {
            // Given a board with piece on it
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, X, X, X, N, N, N, N],
                [_, _, _, _, _, X, _, _, N, N, N, N, N],
                [_, _, _, _, _, X, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, noCaptures, 1, MGPOptional.empty(), GoPhase.PLAYING);

            // When playing on another piece
            const move: GoMove = new GoMove(6, 6);

            // Then the move should be illegal
            const reason: string = GoFailure.OCCUPIED_INTERSECTION();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid suicide', () => {
            // Given a board with a coord without freedom
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, X, X, X, N, N, N, N],
                [_, _, _, _, _, X, O, O, N, N, N, N, N],
                [_, _, _, _, _, X, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, noCaptures, 0, MGPOptional.empty(), GoPhase.PLAYING);

            // When trying to play in that coord without capturing
            const move: GoMove = new GoMove(6, 12);

            // Then the move should be illegal
            const reason: string = GoFailure.CANNOT_COMMIT_SUICIDE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

    });

    describe('GoPhase.PASSED', () => {

        it('GoPhase.PASSED + GoMove/play = GoPhase.PLAYING', () => {
            // Given a board on passed phase
            const board: Table<GoPiece> = rules.getInitialState(defaultConfig).board;
            const state: GoState = new GoState(board, noCaptures, 0, MGPOptional.empty(), GoPhase.PASSED);

            // When doing a move again
            const move: GoMove = new GoMove(6, 6);

            // Then the game should move back to the playing phase
            const expectedBoard: Table<GoPiece> = [
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
            ];
            const expectedState: GoState =
                new GoState(expectedBoard, noCaptures, 1, MGPOptional.empty(), GoPhase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('GoPhase.PASSED + GoMove.PASS = GoPhase.COUNTING', () => {
            // Given a board on passed phase
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, _],
                [N, N, N, N, N, _, _, _, _, _, _, X, X],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, O, O, _, _, _, _, N, N, N, N, N],
                [_, X, _, O, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState = new GoState(board, noCaptures, 3, MGPOptional.empty(), GoPhase.PASSED);

            // When passing again
            const move: GoMove = GoMove.PASS;

            // Then the move should succeed and the board in counting phase
            const expectedBoard: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, w],
                [N, N, N, N, N, _, _, _, _, _, _, X, X],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, O, O, _, _, _, _, N, N, N, N, N],
                [_, X, _, O, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: GoState =
                new GoState(expectedBoard, PlayerNumberMap.of(0, 1), 4, MGPOptional.empty(), GoPhase.COUNTING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('simply split board should be simple to calculate', () => {
            // Given a simply split board on which one player passed
            const previousBoard: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, X, _, _],
                [N, N, N, N, N, _, _, _, _, _, X, _, _],
                [N, N, N, N, _, _, _, _, _, _, X, _, _],
                [N, N, N, O, _, _, _, _, _, _, X, _, _],
                [N, N, _, O, _, _, _, _, _, _, X, _, _],
                [N, _, _, O, _, _, _, _, _, _, X, _, _],
                [_, _, _, O, _, _, _, _, _, _, X, _, _],
                [_, _, _, O, _, _, _, _, _, _, X, _, N],
                [_, _, _, O, _, _, _, _, _, _, X, N, N],
                [_, _, _, O, _, _, _, _, _, _, N, N, N],
                [_, _, _, O, _, _, _, _, _, N, N, N, N],
                [_, _, _, O, _, _, _, _, N, N, N, N, N],
                [_, _, _, O, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(previousBoard, noCaptures, 10, MGPOptional.empty(), GoPhase.PASSED);

            // When passing again
            const move: GoMove = GoMove.PASS;

            // Then board value should change to match simple territory
            const expectedBoard: GoPiece[][] = [
                [N, N, N, N, N, N, _, _, _, _, X, w, w],
                [N, N, N, N, N, _, _, _, _, _, X, w, w],
                [N, N, N, N, _, _, _, _, _, _, X, w, w],
                [N, N, N, O, _, _, _, _, _, _, X, w, w],
                [N, N, b, O, _, _, _, _, _, _, X, w, w],
                [N, b, b, O, _, _, _, _, _, _, X, w, w],
                [b, b, b, O, _, _, _, _, _, _, X, w, w],
                [b, b, b, O, _, _, _, _, _, _, X, w, N],
                [b, b, b, O, _, _, _, _, _, _, X, N, N],
                [b, b, b, O, _, _, _, _, _, _, N, N, N],
                [b, b, b, O, _, _, _, _, _, N, N, N, N],
                [b, b, b, O, _, _, _, _, N, N, N, N, N],
                [b, b, b, O, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: GoState =
                new GoState(expectedBoard, PlayerNumberMap.of(24, 15), 11, MGPOptional.empty(), GoPhase.COUNTING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('GoPhase.COUNTING', () => {

        it('should be GameStatus.ONGOING', () => {
            // Given a board with a shared territory
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, _, _, _, _, _, _, N, N, N, N, N],
                [X, _, _, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, PlayerNumberMap.of(10, 1), 0, MGPOptional.empty(), GoPhase.COUNTING);
            const node: GoNode = new GoNode(state);

            // When evaluating it
            // Then it should be considered as ongoing
            RulesUtils.expectToBeOngoing(rules, node, defaultConfig);
        });

        it('should attribute shared territory to surviving group', () => {
            // Given a board with a shared territory
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, w, w, w, w, w, w, w],
                [N, N, N, N, N, w, w, w, w, w, w, w, w],
                [N, N, N, N, w, w, w, w, w, w, w, w, w],
                [N, N, N, w, w, w, w, w, w, w, w, w, w],
                [N, N, w, w, w, w, w, w, w, w, w, w, w],
                [N, w, w, w, w, w, w, w, w, w, w, w, w],
                [w, w, w, w, w, w, w, w, w, w, w, w, w],
                [w, w, w, w, w, w, w, w, w, w, w, w, N],
                [w, w, w, w, w, w, w, w, w, w, w, N, N],
                [w, w, w, w, w, w, w, w, w, w, N, N, N],
                [X, X, X, w, w, w, w, w, w, N, N, N, N],
                [_, _, X, w, w, w, w, w, N, N, N, N, N],
                [O, _, X, w, w, w, w, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, PlayerNumberMap.of(0, 78), 0, MGPOptional.empty(), GoPhase.COUNTING);

            // When marking as dead one of the group sharing this territory
            const move: GoMove = new GoMove(0, 12);

            // Then the clicked group should be marked as dead and the territory attributed to the opponent
            const expectedBoard: Table<GoPiece> = [
                [N, N, N, N, N, N, w, w, w, w, w, w, w],
                [N, N, N, N, N, w, w, w, w, w, w, w, w],
                [N, N, N, N, w, w, w, w, w, w, w, w, w],
                [N, N, N, w, w, w, w, w, w, w, w, w, w],
                [N, N, w, w, w, w, w, w, w, w, w, w, w],
                [N, w, w, w, w, w, w, w, w, w, w, w, w],
                [w, w, w, w, w, w, w, w, w, w, w, w, w],
                [w, w, w, w, w, w, w, w, w, w, w, w, N],
                [w, w, w, w, w, w, w, w, w, w, w, N, N],
                [w, w, w, w, w, w, w, w, w, w, N, N, N],
                [X, X, X, w, w, w, w, w, w, N, N, N, N],
                [w, w, X, w, w, w, w, w, N, N, N, N, N],
                [u, w, X, w, w, w, w, N, N, N, N, N, N],
            ];
            const expectedState: GoState =
                new GoState(expectedBoard, PlayerNumberMap.of(0, 83), 1, MGPOptional.empty(), GoPhase.COUNTING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should transfer territory when marking group as dead', () => {
            // Given a board where a group owns territory
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, w, w, w, w, w, w, w],
                [N, N, N, N, N, w, w, w, w, w, w, w, w],
                [N, N, N, N, w, w, w, w, w, w, w, w, w],
                [N, N, N, w, w, w, w, w, w, w, w, w, w],
                [N, N, w, w, w, w, w, w, w, w, w, w, w],
                [N, w, w, w, w, w, w, w, w, w, w, w, w],
                [w, w, w, w, w, w, w, w, w, w, w, w, w],
                [w, w, w, w, w, w, w, w, w, w, w, w, N],
                [w, w, w, w, w, w, w, w, w, w, w, N, N],
                [w, w, w, w, w, w, w, w, w, w, N, N, N],
                [X, X, X, w, w, w, w, w, w, N, N, N, N],
                [O, O, X, w, w, w, w, w, N, N, N, N, N],
                [b, O, X, w, w, w, w, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, PlayerNumberMap.of(1, 118), 7, MGPOptional.empty(), GoPhase.COUNTING);

            // When marking this group as dead
            const move: GoMove = new GoMove(0, 11);

            // Then it should transfer its territory to the opponent
            const expectedBoard: GoPiece[][] = [
                [N, N, N, N, N, N, w, w, w, w, w, w, w],
                [N, N, N, N, N, w, w, w, w, w, w, w, w],
                [N, N, N, N, w, w, w, w, w, w, w, w, w],
                [N, N, N, w, w, w, w, w, w, w, w, w, w],
                [N, N, w, w, w, w, w, w, w, w, w, w, w],
                [N, w, w, w, w, w, w, w, w, w, w, w, w],
                [w, w, w, w, w, w, w, w, w, w, w, w, w],
                [w, w, w, w, w, w, w, w, w, w, w, w, N],
                [w, w, w, w, w, w, w, w, w, w, w, N, N],
                [w, w, w, w, w, w, w, w, w, w, N, N, N],
                [X, X, X, w, w, w, w, w, w, N, N, N, N],
                [u, u, X, w, w, w, w, w, N, N, N, N, N],
                [w, u, X, w, w, w, w, N, N, N, N, N, N],
            ];
            const expectedState: GoState =
                new GoState(expectedBoard, PlayerNumberMap.of(0, 125), 8, MGPOptional.empty(), GoPhase.COUNTING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('GoPhase.COUNTING + GoMove/play = GoPhase.PLAYING', () => {
            // Given a board on counting phase (for example, incorrectly marked)
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, _],
                [N, N, N, N, N, _, _, _, _, _, _, X, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [_, _, O, O, _, _, _, _, N, N, N, N, N],
                [_, _, _, O, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, PlayerNumberMap.of(0, 0), 3, MGPOptional.empty(), GoPhase.COUNTING);

            // When playing on an empty square
            const move: GoMove = new GoMove(3, 3);

            // Then the move should go back to playing phase
            const expectedBoard: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, _],
                [N, N, N, N, N, _, _, _, _, _, _, X, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, X, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [_, _, O, O, _, _, _, _, N, N, N, N, N],
                [_, _, _, O, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: GoState =
                new GoState(expectedBoard, PlayerNumberMap.of(0, 0), 4, MGPOptional.empty(), GoPhase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('GoPhase.COUNTING + GoMove.ACCEPT = GoPhase.ACCEPT', () => {
            // Given a board on counting phase (for example, incorrectly marked)
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, _],
                [N, N, N, N, N, _, _, _, _, _, _, X, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [_, _, O, O, _, _, _, _, N, N, N, N, N],
                [_, _, _, O, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, PlayerNumberMap.of(25, 0), 1, MGPOptional.empty(), GoPhase.COUNTING);

            // When accepting board
            const move: GoMove = GoMove.ACCEPT;

            // Then the move should go to accept phase
            const expectedState: GoState =
                new GoState(board, PlayerNumberMap.of(25, 0), 2, MGPOptional.empty(), GoPhase.ACCEPT);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid PASSING', () => {
            // Given a board on counting phase
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, _],
                [N, N, N, N, N, _, _, _, _, _, _, X, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [_, _, O, O, _, _, _, _, N, N, N, N, N],
                [_, _, _, O, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState = new GoState(board, noCaptures, 1, MGPOptional.empty(), GoPhase.COUNTING);

            // When passing
            const move: GoMove = GoMove.PASS;

            // Then the move should be illegal
            const reason: string = GoFailure.CANNOT_PASS_AFTER_PASSED_PHASE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

    });

    describe('GoPhase.ACCEPT', () => {

        it('GoPhase.ACCEPT + GoMove/play = GoPhase.PLAYING', () => {
            // Given a board on ACCEPT phase (for example, incorrectly marked)
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, w],
                [N, N, N, N, N, _, _, _, _, _, _, X, X],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, O, O, _, _, _, _, N, N, N, N, N],
                [b, b, b, O, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, PlayerNumberMap.of(3, 1), 3, MGPOptional.empty(), GoPhase.ACCEPT);

            // When playing on an empty square
            const move: GoMove = new GoMove(3, 3);

            // Then the move should go back to playing phase
            const expectedBoard: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, _],
                [N, N, N, N, N, _, _, _, _, _, _, X, X],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, X, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, O, O, _, _, _, _, N, N, N, N, N],
                [_, _, _, O, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: GoState =
                new GoState(expectedBoard, PlayerNumberMap.of(0, 0), 4, MGPOptional.empty(), GoPhase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('GoPhase.ACCEPT + GoMove/play should capture', () => {
            // Given a board on accepted phase
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, O],
                [N, N, N, N, N, _, _, _, _, _, _, X, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, O, O, _, _, _, _, N, N, N, N, N],
                [b, b, b, O, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, PlayerNumberMap.of(3, 0), 5, MGPOptional.empty(), GoPhase.ACCEPT);

            // When clicking on an empty square that could capture (even if the piece so far is still "dead")
            const move: GoMove = new GoMove(12, 1);

            // Then the capture should be done and the game back to playing phase
            const expectedBoard: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, _],
                [N, N, N, N, N, _, _, _, _, _, _, X, X],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, O, O, _, _, _, _, N, N, N, N, N],
                [_, _, _, O, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: GoState =
                new GoState(expectedBoard, PlayerNumberMap.of(0, 1), 6, MGPOptional.empty(), GoPhase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('GoPhase.ACCEPT + GoMove/markAsDead = GoPhase.COUNTING', () => {
            // Given a board on accepted phase
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, O],
                [N, N, N, N, N, _, _, _, _, _, _, X, _],
                [N, N, N, N, _, _, _, _, _, _, _, X, X],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, O, O, _, _, _, _, N, N, N, N, N],
                [b, b, b, O, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState = new GoState(board, PlayerNumberMap.of(3, 0), 1, MGPOptional.empty(), GoPhase.ACCEPT);

            // When clicking on a piece to mark it as dead
            const move: GoMove = new GoMove(12, 0);

            // Then the piece should be marked as dead and the board back to counting phase
            const expectedBoard: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, u],
                [N, N, N, N, N, _, _, _, _, _, _, X, w],
                [N, N, N, N, _, _, _, _, _, _, _, X, X],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, O, O, _, _, _, _, N, N, N, N, N],
                [b, b, b, O, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: GoState =
                new GoState(expectedBoard, PlayerNumberMap.of(3, 3), 2, MGPOptional.empty(), GoPhase.COUNTING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('GoPhase.ACCEPT + GoMove.ACCEPT = Game Over', () => {
            // Given a board on accepted phase
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, O],
                [N, N, N, N, N, _, _, _, _, _, _, X, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, O, O, _, _, _, _, N, N, N, N, N],
                [w, w, w, O, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState = new GoState(board, PlayerNumberMap.of(1, 2), 1, MGPOptional.empty(), GoPhase.ACCEPT);

            // When accepting as well
            const move: GoMove = GoMove.ACCEPT;

            // Then the move should succeed and the game should be over
            const expectedState: GoState =
                new GoState(board, PlayerNumberMap.of(1, 2), 2, MGPOptional.empty(), GoPhase.FINISHED);
            const node: GoNode = new GoNode(expectedState);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

    });

    describe('End Game', () => {

        it('should calculate correctly board with dead stones (And Recognize Draw)', () => {
            // Given a board with the same number of point for every player
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, u],
                [N, N, N, N, N, _, _, _, _, _, _, X, b],
                [N, N, N, N, _, _, _, _, _, _, _, X, b],
                [N, N, N, _, _, _, _, _, _, _, _, X, X],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, O, O, _, _, _, _, N, N, N, N, N],
                [k, w, w, O, _, _, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, PlayerNumberMap.of(4, 4), 4, MGPOptional.empty(), GoPhase.FINISHED);
            const node: GoNode = new GoNode(state);

            // When evaluating its value
            // Then it should see the draw
            RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        });

        it('should recognize victory', () => {
            // Given a board where Player.ZERO win
            const board: Table<GoPiece> = [
                [N, N, N, N, N, N, _, _, _, _, _, X, u],
                [N, N, N, N, N, _, _, _, _, _, _, X, b],
                [N, N, N, N, _, _, _, _, _, _, _, X, b],
                [N, N, N, _, _, _, _, _, _, _, _, X, X],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, O, O, O, _, _, _, N, N, N, N, N],
                [k, w, w, w, O, _, _, N, N, N, N, N, N],
            ];
            const state: GoState =
                new GoState(board, PlayerNumberMap.of(5, 4), 2, MGPOptional.empty(), GoPhase.FINISHED);
            const node: GoNode = new GoNode(state);

            // When evaluating it
            // Then it should be recognized as a victory for Player.ZERO
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

    });

});
