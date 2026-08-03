/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';
import { TestUtils } from '@everyboard/lib/testing';

import { Coord, CoordFailure } from '../../../jscaip/Coord';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { Player } from '../../../jscaip/Player';
import { RulesFailure } from '../../../jscaip/RulesFailure';
import { RectangularShape } from '../../../jscaip/shape/RectangularShape';
import { Shape } from '../../../jscaip/shape/Shape';
import { ToroidalShape } from '../../../jscaip/shape/ToroidalShape';
import { TriangularShape } from '../../../jscaip/shape/TriangularShape';
import { SimpleGameStateWithTable } from '../../../jscaip/state/SimpleGameStateWithTable';
import { TopologicGameState } from '../../../jscaip/state/TopologicGameState';
import { TopologicGameStateWithTable } from '../../../jscaip/state/TopologicGameStateWithTable';
import { RulesUtils } from '../../../jscaip/tests/RulesUtils.spec';
import { HexagonalTopology } from '../../../jscaip/topology/HexagonalTopology';
import { SquareTopology } from '../../../jscaip/topology/SquareTopology';
import { Topology } from '../../../jscaip/topology/Topology';
import { TriangularTopology } from '../../../jscaip/topology/TriangularTopology';
import { ConnectNMove } from '../ConnectNMove';
import { ConnectNConfig, ConnectNNode, ConnectNRules } from '../ConnectNRules';

const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;

const defaultConfig: ConnectNConfig = ConnectNRules.get().getDefaultRulesConfig();

fdescribe('ConnectNRules (SQUARE)', () => {
    /**
     * Naming of cases, some of them will be used
     * A. double open: _ _ X X X X _ _
     * B. open: O _ X X X X _ O
     * C. cross-open: O _ X X X X _ _
     * D. closed: O X X X X _ O
     */

    let rules: ConnectNRules;
    const defaultTopology: Topology = new SquareTopology();
    const defaultShape: Shape = new RectangularShape(defaultConfig.boardSize, defaultConfig.boardSize, defaultTopology);

    beforeEach(() => {
        rules = ConnectNRules.get();
    });

    fdescribe('first turn', () => {

        it('should not create move when coord is out of board', () => {
            // Given the initial state
            const state: TopologicGameState<FourStatePiece> = ConnectNRules.get().getInitialState(defaultConfig);

            // When dropping out of the board
            const move: ConnectNMove = ConnectNMove.of([new Coord(-1, -1)]);

            // Then the move should be illegal
            const reason: string = CoordFailure.OUT_OF_RANGE(new Coord(-1, -1));
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow the first player play only one piece', () => {
            // Given the initial state
            const state: TopologicGameState<FourStatePiece> = ConnectNRules.get().getInitialState(defaultConfig);

            // When dropping one piece
            const move: ConnectNMove = ConnectNMove.of([new Coord(9, 9)]);

            // Then the move should succeed
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable<FourStatePiece>([
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
            const expectedState: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                expectedGameState,
            );
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        fit('should refuse move that drops two pieces on first turn', () => {
            // Given the first turn
            const state: TopologicGameState<FourStatePiece> = ConnectNRules.get().getInitialState(defaultConfig);

            // When dropping two pieces
            const move: ConnectNMove = ConnectNMove.of([new Coord(11, 11), new Coord(10, 10)]);

            // Then the attempt should throw
            function tryDoubleDropOnFirstTurn(): void {
                rules.isLegal(move, state);
            }
            TestUtils.expectToThrowAndLog(tryDoubleDropOnFirstTurn, 'ConnectNMove should only be used after first move');
        });

    });

    describe('next turns', () => {

        it('should forbid move where second coord is out of range', () => {
            // Given any board on second turn
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
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
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When doing a move who'se second coord is out of range
            const move: ConnectNMove = ConnectNMove.of([new Coord(0, 0), new Coord(-1, -1)]);

            // Then the move should be illegal
            const reason: string = CoordFailure.OUT_OF_RANGE(new Coord(-1, -1));
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid move where first coord is out of range', () => {
            // Given any board on second turn
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
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
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When doing a move who'se second coord is out of range
            const move: ConnectNMove = ConnectNMove.of([new Coord(-2, -2), new Coord(0, 0)]);

            // Then the move should be illegal
            const reason: string = CoordFailure.OUT_OF_RANGE(new Coord(-2, -2));
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should refuse dropping first coord on another piece', () => {
            // Given a board with pieces on it
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
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
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When dropping piece on it with the first coord already occupied
            const move: ConnectNMove =
                ConnectNMove.of([new Coord(9, 9), new Coord(10, 10)]);

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should refuse dropping second coord on another piece', () => {
            // Given a board with pieces on it
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
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
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When dropping piece on it with the second coord already occupied
            const move: ConnectNMove = ConnectNMove.of([new Coord(8, 8), new Coord(9, 9)]);

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow move that drop two pieces on empty pieces', () => {
            // Given a board with pieces on it
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
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
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When dropping pieces on empty squares
            const move: ConnectNMove = ConnectNMove.of([new Coord(7, 7), new Coord(8, 8)]);
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable<FourStatePiece>([
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
            const expectedState: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
                defaultTopology,
                defaultShape,
                expectedGameState,
            );

            // Then the move should succeed
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should refuse dropping only one piece after first turn', () => {
            // Given a board that is not first turn
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
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
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When dropping only one piece
            const move: ConnectNMove = ConnectNMove.of([new Coord(9, 9)]);

            // Then the move should be illegal
            function trySingleDropAfterFirstTurn(): void {
                rules.isLegal(move, state);
            }
            TestUtils.expectToThrowAndLog(trySingleDropAfterFirstTurn, 'ConnectNMove should only be used at first move');
        });

        it('should notify victory when aligning 6 stones of your color', () => {
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
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
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
                defaultTopology,
                defaultShape,
                gameState,
            );
            const move: ConnectNMove =
                ConnectNMove.of([new Coord(8, 8), new Coord(8, 9)]);
            const previousNode: ConnectNNode = new ConnectNNode(state);
            const node: ConnectNNode =
                new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));

            // When checking the game status
            // Then it should be a victory for Player.ONE
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

        it('should draw when no one can play anymore', () => {
            // Given the wildly unlikely case in which in 180 turn no one win
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
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
            const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When playing the last 181st turn
            const move: ConnectNMove =
                ConnectNMove.of([new Coord(17, 18), new Coord(18, 18)]);
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> =
                new SimpleGameStateWithTable<FourStatePiece>([
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
            const expectedState: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
                defaultTopology,
                defaultShape,
                expectedGameState,
            );

            // Then the board should be a draw
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const previousNode: ConnectNNode = new ConnectNNode(expectedState);
            const node: ConnectNNode =
                new ConnectNNode(expectedState, MGPOptional.of(previousNode), MGPOptional.of(move));
            RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        });

    });

});

describe('ConnectNRules (HEXAGONAL)', () => {


    let rules: ConnectNRules;
    const hexagonalTopology: Topology = new HexagonalTopology();

    beforeEach(() => {
        rules = ConnectNRules.get();
    });

    it('should notify victory when aligning 6 stones of your color', () => {
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'HEXAGONAL',
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, O, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, X, X, O, _, _, _, _, _, _, _, _, _, _, _, _, X, X, X],
            [X, O, O, O, O, O, X, _, _, _, _, _, _, _, _, _, _, _, _],
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
        const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
            hexagonalTopology,
            new ToroidalShape(19, 19, hexagonalTopology),
            gameState,
        );
        const move: ConnectNMove =
            ConnectNMove.of([new Coord(0, 8), new Coord(0, 9)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));
        // When checking the game status
        // Then it should be a victory for Player.ONE
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, customConfig);
    });
});

describe('ConnectNRules (TRIANGULAR)', () => {


    let rules: ConnectNRules;

    beforeEach(() => {
        rules = ConnectNRules.get();
    });

    it('should notify victory when aligning 6 stones of your color (DOWN-RIGHT)', () => {
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'TRIANGULAR',
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, X, X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
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
        const topology: Topology = new TriangularTopology();
        const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
            topology,
            new TriangularShape(19, topology),
            gameState,
        );
        const move: ConnectNMove =
            ConnectNMove.of([new Coord(0, 0), new Coord(3, 3)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));
        // When checking the game status
        // Then it should be a victory for Player.ONE
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, customConfig);
    });

    it('should notify victory when aligning 6 stones of your color (RIGHT)', () => {
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'TRIANGULAR',
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, X, X, X, X, X, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
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
        const topology: Topology = new TriangularTopology();
        const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
            topology,
            new TriangularShape(19, topology),
            gameState,
        );
        const move: ConnectNMove =
            ConnectNMove.of([new Coord(0, 0), new Coord(3, 3)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));
        // When checking the game status
        // Then it should be a victory for Player.ONE
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, customConfig);
    });

    it('should notify victory when aligning 6 stones of your color (UP-RIGHT)', () => {
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'TRIANGULAR',
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, X, X, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, X, X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
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
        const topology: Topology = new TriangularTopology();
        const state: TopologicGameState<FourStatePiece> = new TopologicGameStateWithTable<FourStatePiece>(
            topology,
            new TriangularShape(19, topology),
            gameState,
        );
        const move: ConnectNMove =
            ConnectNMove.of([new Coord(0, 0), new Coord(3, 3)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));
        // When checking the game status
        // Then it should be a victory for Player.ONE
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, customConfig);
    });
});
