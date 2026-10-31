/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { FourStatePiece } from '../../../../jscaip/FourStatePiece';
import { Player } from '../../../../jscaip/Player';
import { PlayerNumberMap } from '../../../../jscaip/PlayerMap';
import { RulesFailure } from '../../../../jscaip/RulesFailure';
import { Table } from '../../../../jscaip/TableUtils';
import { Direction } from '../../../../jscaip/direction/Direction';
import { EightDirection } from '../../../../jscaip/direction/EightDirection';
import { HexaDirection } from '../../../../jscaip/direction/HexaDirection';
import { HexagonShape } from '../../../../jscaip/shape/HexagonShape';
import { RectangleShape } from '../../../../jscaip/shape/RectangleShape';
import { TorusShape } from '../../../../jscaip/shape/TorusShape';
import { TriangleShape } from '../../../../jscaip/shape/TriangleShape';
import { SimpleGameStateWithTable } from '../../../../jscaip/state/SimpleGameStateWithTable';
import { RulesUtils } from '../../../../jscaip/tests/RulesUtils.spec';
import { EightDirectionSquareTopology } from '../../../../jscaip/topology/EightDirectionSquareTopology';
import { HexagonalTopology } from '../../../../jscaip/topology/HexagonalTopology';
import { ReversiConfig, ReversiNode } from '../../common/AbstractReversiRules';
import { ReversiFailure } from '../../common/ReversiFailure';
import { ReversiMove } from '../../common/ReversiMove';
import { ReversiState } from '../../common/ReversiState';
import { ReversiRules } from '../ReversiRules';

describe('ReversiRules', () => {

    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const eightDirectionSquareTopology: EightDirectionSquareTopology = new EightDirectionSquareTopology();
    const squareShape: RectangleShape<EightDirection> = new RectangleShape(8, 8, eightDirectionSquareTopology);
    const defaultInitialState: ReversiState<EightDirection> =
        ReversiRules.get().getInitialState(ReversiRules.get().getDefaultRulesConfig()) as ReversiState<EightDirection>;

    let rules: ReversiRules;
    let defaultConfig: ReversiConfig;

    beforeEach(() => {
        rules = ReversiRules.get();
        defaultConfig = rules.getDefaultRulesConfig();
    });

    it('should be created', () => {
        expect(rules).toBeTruthy();
        const node: ReversiNode = rules.getInitialNode(defaultConfig);
        expect(node.gameState.turn).withContext('Game should start a turn 0').toBe(0);
    });

    it('First move should be legal and change score', () => {
        // Given the initial state
        const state: ReversiState<EightDirection> = defaultInitialState;

        // When doing a legal move
        const move: ReversiMove = new ReversiMove(2, 4);

        // Then the move should succeed and the score changed
        const expectedBoard: Table<FourStatePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, O, X, _, _, _],
            [_, _, O, O, O, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const expectedGameState: SimpleGameStateWithTable<FourStatePiece> =
            new SimpleGameStateWithTable(expectedBoard, 1);
        const expectedState: ReversiState<Direction> =
            new ReversiState(eightDirectionSquareTopology, squareShape, expectedGameState);
        const node: ReversiNode = new ReversiNode(expectedState);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        expect(node.gameState.countScore()).toEqual(PlayerNumberMap.of(4, 1));
    });

    it('Passing at first turn should be illegal', () => {
        // Given the initial state
        const state: ReversiState<Direction> = defaultInitialState;

        // When passing
        const move: ReversiMove = ReversiMove.PASS;

        // Then the move should be illegal
        const reason: string = RulesFailure.CANNOT_PASS();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should forbid non capturing move', () => {
        // Given the initial state
        const state: ReversiState<Direction> = defaultInitialState;

        // When doing a non capturing move
        const move: ReversiMove = new ReversiMove(0, 0);

        // Then the move should be illegal
        const reason: string = ReversiFailure.NO_ELEMENT_SWITCHED();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should forbid choosing occupied space', () => {
        // Given the initial state
        const state: ReversiState<Direction> = defaultInitialState;

        // When playing on an occupied square
        const move: ReversiMove = new ReversiMove(3, 3);

        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SPACE();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should allow player to pass when no other moves are possible', () => {
        // Given a board where current player must pass
        const board: Table<FourStatePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, O, _, _, _],
        ];
        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 1);
        const state: ReversiState<Direction> =
            new ReversiState(eightDirectionSquareTopology, squareShape, gameState);

        // When passing
        const move: ReversiMove = ReversiMove.PASS;

        // Then the move should succeed
        const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 1);
        const expectedState: ReversiState<EightDirection> =
            new ReversiState(eightDirectionSquareTopology, squareShape, expectedGameState);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    describe('Endgames', () => {

        it('should consider the player with the more point the winner at the end', () => {
            const board: Table<FourStatePiece> = [
                [O, X, X, X, X, X, X, O],
                [O, X, X, O, O, X, X, O],
                [O, X, O, X, X, X, X, O],
                [O, X, X, X, X, X, X, O],
                [O, X, X, X, O, O, X, O],
                [O, X, X, O, O, O, X, O],
                [O, O, O, O, O, O, O, O],
                [_, O, O, O, O, O, X, O],
            ];
            const expectedBoard: Table<FourStatePiece> = [
                [O, X, X, X, X, X, X, O],
                [O, X, X, O, O, X, X, O],
                [O, X, O, X, X, X, X, O],
                [O, X, X, X, X, X, X, O],
                [O, X, X, X, O, O, X, O],
                [O, X, X, O, O, O, X, O],
                [O, X, O, O, O, O, O, O],
                [X, X, X, X, X, X, X, O],
            ];
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 59);
            const state: ReversiState<Direction> =
                new ReversiState(eightDirectionSquareTopology, squareShape, gameState);
            const move: ReversiMove = new ReversiMove(0, 7);
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable(expectedBoard, 60);
            const expectedState: ReversiState<EightDirection> =
                new ReversiState(eightDirectionSquareTopology, squareShape, expectedGameState);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: ReversiNode = new ReversiNode(expectedState, undefined, MGPOptional.of(move));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

        it('should consider the player with the more point the winner at the end (Player.ZERO remix)', () => {
            const board: Table<FourStatePiece> = [
                [X, O, O, O, O, O, O, X],
                [X, O, O, X, X, O, O, X],
                [X, O, X, O, O, O, O, X],
                [X, O, O, O, O, O, O, X],
                [X, O, O, O, X, X, O, X],
                [X, O, O, X, X, X, O, X],
                [X, X, X, X, X, X, X, X],
                [_, X, X, X, X, X, O, X],
            ];
            const expectedBoard: Table<FourStatePiece> = [
                [X, O, O, O, O, O, O, X],
                [X, O, O, X, X, O, O, X],
                [X, O, X, O, O, O, O, X],
                [X, O, O, O, O, O, O, X],
                [X, O, O, O, X, X, O, X],
                [X, O, O, X, X, X, O, X],
                [X, O, X, X, X, X, X, X],
                [O, O, O, O, O, O, O, X],
            ];
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 60);
            const state: ReversiState<Direction> =
                new ReversiState(eightDirectionSquareTopology, squareShape, gameState);
            const move: ReversiMove = new ReversiMove(0, 7);
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable(expectedBoard, 61);
            const expectedState: ReversiState<EightDirection> =
                new ReversiState(eightDirectionSquareTopology, squareShape, expectedGameState);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: ReversiNode = new ReversiNode(expectedState, undefined, MGPOptional.of(move));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it('should recognize draws', () => {
            const board: Table<FourStatePiece> = [
                [O, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [X, O, O, O, X, X, X, X],
                [_, O, O, O, X, X, X, X],
            ];
            const expectedBoard: Table<FourStatePiece> = [
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
                [O, O, O, O, X, X, X, X],
            ];
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 60);
            const state: ReversiState<Direction> =
                new ReversiState(eightDirectionSquareTopology, squareShape, gameState);
            const move: ReversiMove = new ReversiMove(0, 7);
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable(expectedBoard, 61);
            const expectedState: ReversiState<EightDirection> =
                new ReversiState(eightDirectionSquareTopology, squareShape, expectedGameState);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: ReversiNode = new ReversiNode(expectedState, undefined, MGPOptional.of(move));
            RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        });

    });

    describe('alternative config', () => {

        describe('Toric Board', () => {

            const toricShape: TorusShape<EightDirection> = new TorusShape(8, 8, eightDirectionSquareTopology);

            const toricConfig: ReversiConfig = {
                ...defaultConfig,
                shape: 'TORUS',
            };

            it('should capture piece sandwiched from across the board horizontally', () => {
                // Given a board where current player can capture on a toroidal board
                // (but could not if it was a rectangular)
                const board: Table<FourStatePiece> = [
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, O, X, O, O, O, O, O],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                ];
                const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 1);
                const state: ReversiState<Direction> =
                    new ReversiState(eightDirectionSquareTopology, toricShape, gameState);

                // When doing a move that captures pieces across the board
                const move: ReversiMove = new ReversiMove(0, 3);

                // Then the move should succeed
                const expectedBoard: Table<FourStatePiece> = [
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [X, X, X, X, X, X, X, X],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _],
                ];
                const expectedGameState: SimpleGameStateWithTable<FourStatePiece> =
                    new SimpleGameStateWithTable(expectedBoard, 2);
                const expectedState: ReversiState<EightDirection> =
                    new ReversiState(eightDirectionSquareTopology, toricShape, expectedGameState);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, toricConfig);
            });

            it('should capture piece sandwiched from across the board vertically', () => {
                // Given a board where current can capture on a toroidal board (but could not if it was a rectangular)
                const board: Table<FourStatePiece> = [
                    [_, _, _, _, _, _, _, _],
                    [_, _, _, _, X, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, X, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, X, _, _, _],
                    [_, _, _, _, X, _, _, _],
                    [_, _, _, _, X, _, _, _],
                ];
                const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 2);
                const state: ReversiState<Direction> =
                    new ReversiState(eightDirectionSquareTopology, toricShape, gameState);

                // When doing a move that captures pieces across the board
                const move: ReversiMove = new ReversiMove(4, 0);

                // Then the move should succeed
                const expectedBoard: Table<FourStatePiece> = [
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, X, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, O, _, _, _],
                    [_, _, _, _, O, _, _, _],
                ];
                const expectedGameState: SimpleGameStateWithTable<FourStatePiece> =
                    new SimpleGameStateWithTable(expectedBoard, 3);
                const expectedState: ReversiState<EightDirection> =
                    new ReversiState(eightDirectionSquareTopology, toricShape, expectedGameState);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, toricConfig);
            });

        });

        describe('Hexagonal Board', () => {

            const hexagonalTopology: HexagonalTopology = new HexagonalTopology();
            const hexagonalShape: HexagonShape<HexaDirection> = new TriangleShape(5, hexagonalTopology);

            it('should have initial board with a hole', () => {
                // Given hexagonal shaped board with odd size
                const customConfig: ReversiConfig = {
                    ...defaultConfig,
                    shape: 'HEXAGON',
                    topology: 'HEXAGON',
                    boardSize: 5,
                };

                // When rendering it
                const state: ReversiState<Direction> = ReversiRules.get().getInitialState(customConfig);

                // Then it should have hole in the middle and alternating piece owner around it
                const expectedBoard: Table<FourStatePiece> = [
                    [N, N, N, N, _, _, _, _, _],
                    [N, N, N, _, _, _, _, _, _],
                    [N, N, _, _, _, _, _, _, _],
                    [N, _, _, _, O, X, _, _, _],
                    [_, _, _, X, _, O, _, _, _],
                    [_, _, _, O, X, _, _, _, N],
                    [_, _, _, _, _, _, _, N, N],
                    [_, _, _, _, _, _, N, N, N],
                    [_, _, _, _, _, N, N, N, N],
                ];
                const expectedGameState: SimpleGameStateWithTable<FourStatePiece> =
                    new SimpleGameStateWithTable(expectedBoard, 0);
                const expectedState: ReversiState<Direction> = new ReversiState(
                    hexagonalTopology,
                    hexagonalShape,
                    expectedGameState,
                );
                expect(state).toEqual(expectedState);
            });

        });
        // TODO FOR REVIEW: pour le reversi, ça n'ira avec le triangulaire que sur les tailles multiples de trois, pour que le centre soit respecté
        describe('Triangular Board', () => {

            const hexagonalTopology: HexagonalTopology = new HexagonalTopology();
            const hexagonalShape: HexagonShape<HexaDirection> = new HexagonShape(6, hexagonalTopology);
            // TODO: test size 5 and 7 ?
            it('should have initial board packed', () => {
                // Given hexagonal shaped board with odd size
                const customConfig: ReversiConfig = {
                    ...defaultConfig,
                    shape: 'TRIANGLE',
                    topology: 'TRIANGLE',
                    boardSize: 6,
                };

                // When rendering it
                const state: ReversiState<Direction> = ReversiRules.get().getInitialState(customConfig);

                // Then it should have hole in the middle and alternating piece owner around it
                const expectedBoard: Table<FourStatePiece> = [
                    [N, N, N, N, N, N, _, N, N, N, N, N],
                    [N, N, N, N, N, _, _, _, N, N, N, N],
                    [N, N, N, N, _, _, _, _, _, N, N, N],
                    [N, N, N, _, _, N, O, N, _, _, N, N],
                    [N, N, _, _, _, O, N, O, _, _, _, N],
                    [N, _, _, _, _, _, _, _, _, _, _, _],
                ];
                const expectedGameState: SimpleGameStateWithTable<FourStatePiece> =
                    new SimpleGameStateWithTable(expectedBoard, 0);
                const expectedState: ReversiState<Direction> = new ReversiState(
                    hexagonalTopology,
                    hexagonalShape,
                    expectedGameState,
                );
                expect(state).toEqual(expectedState);
            });

        });

    });

});
