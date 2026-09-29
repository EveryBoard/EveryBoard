/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { Player } from '../../../../jscaip/Player';
import { PlayerNumberMap } from '../../../../jscaip/PlayerMap';
import { RulesFailure } from '../../../../jscaip/RulesFailure';
import { Table } from '../../../../jscaip/TableUtils';
import { RulesUtils } from '../../../../jscaip/tests/RulesUtils.spec';
import { ReversiConfig, ReversiNode } from '../../common/AbstractReversiRules';
import { ReversiFailure } from '../../common/ReversiFailure';
import { ReversiMove } from '../../common/ReversiMove';
import { ReversiState } from '../../common/ReversiState';
import { ReversiRules } from '../ReversiRules';
import { FourStatePiece } from '../../../../jscaip/FourStatePiece';
import { SimpleGameStateWithTable } from '../../../../jscaip/state/SimpleGameStateWithTable';
import { OrdinalSquareTopology } from '../../../../jscaip/topology/OrdinalSquareTopology';
import { RectangularShape } from '../../../../jscaip/shape/RectangularShape';
import { Ordinal } from '../../../../jscaip/Ordinal';
import { TriangularTopology } from '../../../../jscaip/topology/TriangularTopology';
import { TriangularShape } from '../../../../jscaip/shape/TriangularShape';
import { Direction } from '../../../../jscaip/Direction';
import { HexagonalTopology } from 'src/app/jscaip/topology/HexagonalTopology';
import { HexagonalShape } from 'src/app/jscaip/shape/HexagonalShape';
import { HexaDirection } from 'dist/app/jscaip/HexaDirection';
import { TorusShape } from 'src/app/jscaip/shape/TorusShape';

fdescribe('ReversiRules', () => {

    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const ordinalTopology: OrdinalSquareTopology = new OrdinalSquareTopology();
    const squareShape: RectangularShape<Ordinal> = new RectangularShape(8, 8, ordinalTopology);

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
        const state: ReversiState = ReversiRules.get().getInitialState(defaultConfig);

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
        const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(expectedBoard, 1);
        const expectedState: ReversiState = new ReversiState(ordinalTopology, squareShape, expectedGameState);
        const node: ReversiNode = new ReversiNode(expectedState);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        expect(node.gameState.countScore()).toEqual(PlayerNumberMap.of(4, 1));
    });

    it('Passing at first turn should be illegal', () => {
        // Given the initial state
        const state: ReversiState = ReversiRules.get().getInitialState(defaultConfig);

        // When passing
        const move: ReversiMove = ReversiMove.PASS;

        // Then the move should be illegal
        const reason: string = RulesFailure.CANNOT_PASS();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should forbid non capturing move', () => {
        // Given the initial state
        const state: ReversiState = ReversiRules.get().getInitialState(defaultConfig);

        // When doing a non capturing move
        const move: ReversiMove = new ReversiMove(0, 0);

        // Then the move should be illegal
        const reason: string = ReversiFailure.NO_ELEMENT_SWITCHED();
        RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
    });

    it('should forbid choosing occupied space', () => {
        // Given the initial state
        const state: ReversiState = ReversiRules.get().getInitialState(defaultConfig);

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
        const state: ReversiState = new ReversiState(ordinalTopology, squareShape, gameState);

        // When passing
        const move: ReversiMove = ReversiMove.PASS;

        // Then the move should succeed
        const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 1);
        const expectedState: ReversiState = new ReversiState(ordinalTopology, squareShape, expectedGameState);
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
            const state: ReversiState = new ReversiState(ordinalTopology, squareShape, gameState);
            const move: ReversiMove = new ReversiMove(0, 7);
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(expectedBoard, 60);
            const expectedState: ReversiState = new ReversiState(ordinalTopology, squareShape, expectedGameState);
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
            const state: ReversiState = new ReversiState(ordinalTopology, squareShape, gameState);
            const move: ReversiMove = new ReversiMove(0, 7);
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(expectedBoard, 61);
            const expectedState: ReversiState = new ReversiState(ordinalTopology, squareShape, expectedGameState);
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
            const state: ReversiState = new ReversiState(ordinalTopology, squareShape, gameState);
            const move: ReversiMove = new ReversiMove(0, 7);
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(expectedBoard, 61);
            const expectedState: ReversiState = new ReversiState(ordinalTopology, squareShape, expectedGameState);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const node: ReversiNode = new ReversiNode(expectedState, undefined, MGPOptional.of(move));
            RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        });

    });

    describe('alternative config', () => {

        describe('Toric Board', () => {

            const toricShape: TorusShape<Ordinal> = new TorusShape(8, 8, ordinalTopology);

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
                const state: ReversiState = new ReversiState(ordinalTopology, toricShape, gameState);

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
                const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(expectedBoard, 2);
                const expectedState: ReversiState = new ReversiState(ordinalTopology, toricShape, expectedGameState);
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
                const state: ReversiState = new ReversiState(ordinalTopology, toricShape, gameState);

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
                const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(expectedBoard, 3);
                const expectedState: ReversiState = new ReversiState(ordinalTopology, toricShape, expectedGameState);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, toricConfig);
            });

        });

        describe('Hexagonal Board', () => {

            const hexagonalTopology: HexagonalTopology = new HexagonalTopology();
            const hexagonalShape: HexagonalShape<HexaDirection> = new TriangularShape(5, hexagonalTopology);

            it('should have initial board with a hole', () => {
                // Given hexagonal shaped board with odd size
                const customConfig: ReversiConfig = {
                    ...defaultConfig,
                    shape: 'HEXAGONAL',
                    topology: 'HEXAGONAL',
                    boardSize: 5
                }

                // When rendering it
                const state: ReversiState = ReversiRules.get().getInitialState(customConfig);

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
                const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(expectedBoard, 0);
                const expectedState: ReversiState = new ReversiState(hexagonalTopology, hexagonalShape, expectedGameState);
                expect(state).toEqual(expectedState);
            });

        });

        describe('Triangular Board', () => {

            const hexagonalTopology: HexagonalTopology = new HexagonalTopology();
            const hexagonalShape: HexagonalShape<HexaDirection> = new HexagonalShape(6, hexagonalTopology);
// TODO: test size 5 and 7 ?
            it('should have initial board packed', () => {
                // Given hexagonal shaped board with odd size
                const customConfig: ReversiConfig = {
                    ...defaultConfig,
                    shape: 'TRIANGULAR',
                    topology: 'TRIANGULAR',
                    boardSize: 6
                }

                // When rendering it
                const state: ReversiState = ReversiRules.get().getInitialState(customConfig);

                // Then it should have hole in the middle and alternating piece owner around it
                const expectedBoard: Table<FourStatePiece> = [
                    [N, N, N, N, N, N, _, N, N, N, N, N],
                    [N, N, N, N, N, _, _, _, N, N, N, N],
                    [N, N, N, N, _, _, _, _, _, N, N, N],
                    [N, N, N, _, _, N, O, N, _, _, N, N],
                    [N, N, _, _, _, O, N, O, _, _, _, N],
                    [N, _, _, _, _, _, _, _, _, _, _, _],
                ];
                const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(expectedBoard, 0);
                const expectedState: ReversiState = new ReversiState(hexagonalTopology, hexagonalShape, expectedGameState);
                expect(state).toEqual(expectedState);
            });

        });

    });

});
