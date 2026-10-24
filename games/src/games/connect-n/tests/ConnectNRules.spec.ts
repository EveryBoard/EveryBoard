/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { Coord, CoordFailure } from '../../../jscaip/Coord';
import { EightDirection } from '../../../jscaip/EightDirection';
import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { HexaDirection } from '../../../jscaip/HexaDirection';
import { Player } from '../../../jscaip/Player';
import { RulesFailure } from '../../../jscaip/RulesFailure';
import { TriangularDirection } from '../../../jscaip/TriangularDirection';
import { RectangularShape } from '../../../jscaip/shape/RectangularShape';
import { TopologicShape } from '../../../jscaip/shape/TopologicShape';
import { TorusShape } from '../../../jscaip/shape/TorusShape';
import { TriangularShape } from '../../../jscaip/shape/TriangularShape';
import { SimpleGameStateWithTable } from '../../../jscaip/state/SimpleGameStateWithTable';
import { TopologicGameState } from '../../../jscaip/state/TopologicGameState';
import { TopologicGameStateWithTable } from '../../../jscaip/state/TopologicGameStateWithTable';
import { RulesUtils } from '../../../jscaip/tests/RulesUtils.spec';
import { EightDirectionSquareTopology } from '../../../jscaip/topology/EightDirectionSquareTopology';
import { HexagonalTopology } from '../../../jscaip/topology/HexagonalTopology';
import { TriangularTopology } from '../../../jscaip/topology/TriangularTopology';
import { ConnectNFailure } from '../ConnectNFailure';
import { ConnectNMove } from '../ConnectNMove';
import { ConnectNConfig, ConnectNNode, ConnectNRules } from '../ConnectNRules';

const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;
const N: FourStatePiece = FourStatePiece.UNREACHABLE;

const defaultConfig: ConnectNConfig = ConnectNRules.get().getDefaultRulesConfig();


describe('ConnectNRules (with default config)', () => {
    /**
     * Naming of cases, some of them will be used
     * A. double open: _ _ X X X X _ _
     * B. open: O _ X X X X _ O
     * C. cross-open: O _ X X X X _ _
     * D. closed: O X X X X _ O
     */

    let rules: ConnectNRules;
    const defaultTopology: EightDirectionSquareTopology = new EightDirectionSquareTopology();
    const defaultShape: TopologicShape<EightDirection> = new RectangularShape(
        defaultConfig.boardSize,
        defaultConfig.boardSize,
        defaultTopology,
    );

    beforeEach(() => {
        rules = ConnectNRules.get();
    });

    describe('first turn', () => {

        it('should consider move illegal when coord is out of board', () => {
            // Given the initial state
            const state: TopologicGameState<FourStatePiece, EightDirection> =
                ConnectNRules.get().getInitialState(defaultConfig);

            // When dropping out of the board
            const move: ConnectNMove = ConnectNMove.of([new Coord(-1, -1)]);

            // Then the move should be illegal
            const reason: string = CoordFailure.OUT_OF_RANGE(new Coord(-1, -1));
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow the first player play only one piece', () => {
            // Given the initial state
            const state: TopologicGameState<FourStatePiece, EightDirection> =
                ConnectNRules.get().getInitialState(defaultConfig);

            // When dropping one piece
            const move: ConnectNMove = ConnectNMove.of([new Coord(9, 9)]);

            // Then the move should succeed
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
            const expectedState: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                expectedGameState,
            );
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should refuse move that drops two pieces on first turn', () => {
            // Given the first turn
            const state: TopologicGameState<FourStatePiece, EightDirection> =
                ConnectNRules.get().getInitialState(defaultConfig);

            // When dropping two pieces
            const move: ConnectNMove = ConnectNMove.of([new Coord(11, 11), new Coord(10, 10)]);

            // Then the attempt should throw
            const reason: string = ConnectNFailure.YOU_MUST_DROP_ONE_AT_FIRST_TURN();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

    });

    describe('next turns', () => {

        it('should forbid move where second coord is out of range', () => {
            // Given any board on second turn
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
            const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When doing a move whose second coord is out of range
            const move: ConnectNMove = ConnectNMove.of([new Coord(0, 0), new Coord(-1, -1)]);

            // Then the move should be illegal
            const reason: string = CoordFailure.OUT_OF_RANGE(new Coord(-1, -1));
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid move where first coord is out of range', () => {
            // Given any board on second turn
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
            const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When doing a move whose second coord is out of range
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
            const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
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
            const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
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
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
            const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When dropping pieces on empty squares
            const move: ConnectNMove = ConnectNMove.of([new Coord(7, 7), new Coord(8, 8)]);
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
            const expectedState: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                expectedGameState,
            );

            // Then the move should succeed
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should refuse dropping only one piece after first turn', () => {
            // Given a board that is not first turn
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
            const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When dropping only one piece
            const move: ConnectNMove = ConnectNMove.of([new Coord(9, 9)]);

            // Then the move should be illegal
            const reason: string = ConnectNFailure.YOU_MUST_PLAY_EXACTLY_N_PIECES(defaultConfig.dropAfterFirstTurn);
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should notify victory when aligning 6 stones of your color', () => {
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
            const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
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
            // Given the wildly unlikely case in which in 180 turn no one wins
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
            const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When playing the last 181st turn
            const move: ConnectNMove =
                ConnectNMove.of([new Coord(17, 18), new Coord(18, 18)]);
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
            const expectedState: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
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

        it('should allow move with less drop when board is full after drops', () => {
            // Given any board with not enough space to do your last move fully (without victory)
            const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
                [X, O, X, O, X, O, X, O, X, O, X, O, X, O, X, O, X, O, _],
            ], 180);
            const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                gameState,
            );

            // When doing that last move incomplete
            const move: ConnectNMove =
                ConnectNMove.of([new Coord(17, 18), new Coord(18, 18)]);
            const expectedGameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
            const expectedState: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
                defaultTopology,
                defaultShape,
                expectedGameState,
            );

            // Then it should be a draw
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            const previousNode: ConnectNNode = new ConnectNNode(expectedState);
            const node: ConnectNNode =
                new ConnectNNode(expectedState, MGPOptional.of(previousNode), MGPOptional.of(move));
            RulesUtils.expectToBeDraw(rules, node, defaultConfig);
        });

    });

});


describe('ConnectNRules (with hexagonal config)', () => {

    let rules: ConnectNRules;
    const hexagonalTopology: HexagonalTopology = new HexagonalTopology();

    beforeEach(() => {
        rules = ConnectNRules.get();
    });

    it('should notify victory when aligning 6 stones of your color (RIGHT)', () => {
        // Given an hexagonal config and a board with six aligned pieces
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
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, X, X, X, X, X, _, _, _, _, _, _, _, _, _, _, _, _, _],
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
        const state: TopologicGameState<FourStatePiece, HexaDirection> = new TopologicGameStateWithTable(
            hexagonalTopology,
            new RectangularShape(19, 19, hexagonalTopology),
            gameState,
        );
        const move: ConnectNMove =
            ConnectNMove.of([new Coord(0, 8), new Coord(1, 8)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));
        // When checking the game status
        // Then it should be a victory for Player.ONE
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, customConfig);
    });

    it('should notify victory when aligning 6 stones of your color (UP-RIGHT)', () => {
        // Given an hexagonal config and a board with six aligned pieces
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'HEXAGONAL',
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
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
        const state: TopologicGameState<FourStatePiece, HexaDirection> = new TopologicGameStateWithTable(
            hexagonalTopology,
            new RectangularShape(19, 19, hexagonalTopology),
            gameState,
        );
        const move: ConnectNMove =
            ConnectNMove.of([new Coord(0, 8), new Coord(1, 7)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));
        // When checking the game status
        // Then it should be a victory for Player.ONE
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, customConfig);
    });

    it('should notify victory when aligning 6 stones of your color (DOWN)', () => {
        // Given an hexagonal config and a board with six aligned pieces
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
            [_, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], 8);
        const state: TopologicGameState<FourStatePiece, HexaDirection> = new TopologicGameStateWithTable(
            hexagonalTopology,
            new RectangularShape(19, 19, hexagonalTopology),
            gameState,
        );
        const move: ConnectNMove =
            ConnectNMove.of([new Coord(5, 5), new Coord(5, 6)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));

        // When checking the game status
        // Then it should be a victory for Player.ONE
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, customConfig);
    });

    it('should not notify victory when aligning 6 stones of your color (DOWN-RIGHT)', () => {
        // Given an hexagonal config and a board with six aligned pieces
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'HEXAGONAL',
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], 8);
        const state: TopologicGameState<FourStatePiece, HexaDirection> = new TopologicGameStateWithTable(
            hexagonalTopology,
            new RectangularShape(19, 19, hexagonalTopology),
            gameState,
        );
        const move: ConnectNMove =
            ConnectNMove.of([new Coord(5, 5), new Coord(6, 6)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));

        // When checking the game status
        // Then it should be a victory for Player.ONE
        RulesUtils.expectToBeOngoing(rules, node, customConfig);
    });

});


describe('ConnectNRules (with triangular config)', () => {

    let rules: ConnectNRules;
    const triangularTopology: TriangularTopology = new TriangularTopology();

    beforeEach(() => {
        rules = ConnectNRules.get();
    });

    it('should notify victory when aligning 6 stones of your color (DOWN-RIGHT)', () => {
        // Given an triangular config and a board with six aligned pieces
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'TRIANGULAR',
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
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
        const state: TopologicGameState<FourStatePiece, TriangularDirection> = new TopologicGameStateWithTable(
            triangularTopology,
            new TriangularShape(19, triangularTopology),
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
        // Given an triangular config and a board with six aligned pieces
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'TRIANGULAR',
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
        const state: TopologicGameState<FourStatePiece, TriangularDirection> = new TopologicGameStateWithTable(
            triangularTopology,
            new TriangularShape(19, triangularTopology),
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
        // Given an triangular config and a board with six aligned pieces
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'TRIANGULAR',
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
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
        const state: TopologicGameState<FourStatePiece, TriangularDirection> = new TopologicGameStateWithTable(
            triangularTopology,
            new TriangularShape(19, triangularTopology),
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

    it('should make a correct triangle as initial state', () => {
        // Given custom config with triangular shape
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            boardSize: 5,
            shape: 'TRIANGULAR',
            topology: 'TRIANGULAR',
        };

        // When rendering initial state
        const expectedInitialState: TopologicGameState<FourStatePiece, TriangularDirection> =
            rules.getInitialState(customConfig);

        // Then it should be a good sized triangle
        const gameState: SimpleGameStateWithTable<FourStatePiece> =
            new SimpleGameStateWithTable<FourStatePiece>([
                [N, N, N, N, _, N, N, N, N],
                [N, N, N, _, _, _, N, N, N],
                [N, N, _, _, _, _, _, N, N],
                [N, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _],
            ], 0);
        const actualInitialState: TopologicGameState<FourStatePiece, TriangularDirection> =
            new TopologicGameStateWithTable(
                triangularTopology,
                new TriangularShape(5, triangularTopology),
                gameState,
            );
        expect(actualInitialState).toEqual(expectedInitialState);
    });
});


describe('ConnectNRules (with rectangular torus config)', () => {

    let rules: ConnectNRules;
    const squareTopology: EightDirectionSquareTopology = new EightDirectionSquareTopology();

    beforeEach(() => {
        rules = ConnectNRules.get();
    });

    it('should notify victory when aligning 6 stones of your color (inside)', () => {
        // Given an  config and a board with six aligned pieces
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'SQUARE (8)',
            shape: 'TORIC',
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable<FourStatePiece>([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
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
        const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
            squareTopology,
            new TorusShape(19, 19, squareTopology),
            gameState,
        );
        const move: ConnectNMove =
            ConnectNMove.of([new Coord(3, 3), new Coord(3, 4)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));

        // When checking the game status
        // Then it should be a victory for Player.ONE
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, customConfig);
    });

    it('should notify victory when aligning 6 stones of your color (cylindric-horizontal)', () => {
        // Given an triangular config and a board with six aligned pieces
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'SQUARE (8)',
            shape: 'TORIC',
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, X, X, _, _, _, _, _, _, _, _, _, _, _, _, _, X, X, X],
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
        const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
            squareTopology,
            new TorusShape(19, 19, squareTopology),
            gameState,
        );
        const move: ConnectNMove =
            ConnectNMove.of([new Coord(0, 3), new Coord(1, 3)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));

        // When checking the game status
        // Then it should be a victory for Player.ONE
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, customConfig);
    });

    it('should notify victory when aligning 6 stones of your color (cylindric-vertical)', () => {
        // Given an triangular config and a board with six aligned pieces
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'SQUARE (8)',
            shape: 'TORIC',
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
            [_, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
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
            [_, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, X, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], 8);
        const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
            squareTopology,
            new TorusShape(19, 19, squareTopology),
            gameState,
        );
        const move: ConnectNMove =
            ConnectNMove.of([new Coord(1, 18), new Coord(1, 17)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));

        // When checking the game status
        // Then it should be a victory for Player.ONE
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, customConfig);
    });

    it('should notify victory when aligning less than 6 stone but completing a line torically', () => {
        // Given an rectangular and toric config and a board with 3 aligned pieces but torically completing a line
        const customConfig: ConnectNConfig = {
            ...defaultConfig,
            topology: 'SQUARE (8)',
            shape: 'TORIC',
            boardSize: 3,
        };

        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable([
            [X, O, _],
            [X, O, _],
            [X, _, _],
        ], 8);
        const state: TopologicGameState<FourStatePiece, EightDirection> = new TopologicGameStateWithTable(
            squareTopology,
            new TorusShape(3, 3, squareTopology),
            gameState,
        );
        const move: ConnectNMove = ConnectNMove.of([new Coord(0, 0), new Coord(0, 1)]);
        const previousNode: ConnectNNode = new ConnectNNode(state);
        const node: ConnectNNode =
            new ConnectNNode(state, MGPOptional.of(previousNode), MGPOptional.of(move));

        // When checking the game status
        // Then it should be an ongoing game
        RulesUtils.expectToBeOngoing(rules, node, customConfig);
    });
});
