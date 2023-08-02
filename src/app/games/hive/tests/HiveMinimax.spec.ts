/* eslint-disable max-lines-per-function */
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Player } from 'src/app/jscaip/Player';
import { HiveHeuristic, HiveMinimax, HiveMoveGenerator } from '../HiveMinimax';
import { HiveMove } from '../HiveMove';
import { HivePiece } from '../HivePiece';
import { HiveNode, HiveRules } from '../HiveRules';
import { HiveState } from '../HiveState';

describe('HiveMoveGenerator', () => {

    let moveGenerator: HiveMoveGenerator;

    const Q: HivePiece = new HivePiece(Player.ZERO, 'QueenBee');
    const B: HivePiece = new HivePiece(Player.ZERO, 'Beetle');
    const S: HivePiece = new HivePiece(Player.ZERO, 'Spider');
    const q: HivePiece = new HivePiece(Player.ONE, 'QueenBee');
    const b: HivePiece = new HivePiece(Player.ONE, 'Beetle');

    beforeEach(() => {
        moveGenerator = new HiveMoveGenerator();
    });
    it('should propose 5 moves at first turn', () => {
        // Given the initial state
        const state: HiveState = HiveState.getInitialState();
        const node: HiveNode = new HiveNode(state);

        // When computing the list of moves
        const moves: HiveMove[] = moveGenerator.getListMoves(node);

        // Then there should be 5 moves
        expect(moves.length).toBe(5);
    });
    it('should propose 6x5 moves at second turn', () => {
        // Given any state in the second turn
        const state: HiveState = HiveState.fromRepresentation([
            [[Q]],
        ], 1);
        const node: HiveNode = new HiveNode(state);

        // When computing the list of moves
        const moves: HiveMove[] = moveGenerator.getListMoves(node);

        // Then there should be 6x5 moves: 6 possible drop locations for 5 pieces
        expect(moves.length).toBe(6 * 5);
    });
    it('should know when to pass', () => {
        // Given a board in a stuck position for a player
        const state: HiveState = HiveState.fromRepresentation([
            [[Q], [B, b, q]],
        ], 5);
        const node: HiveNode = new HiveNode(state);

        // When computing the list of moves
        const moves: HiveMove[] = moveGenerator.getListMoves(node);

        // Then there should be exactly one move: passing
        expect(moves).toEqual([HiveMove.PASS]);
    });
    it('should only drop queen when it must be dropped', () => {
        // Given a state where the player must drop their queen bee at this turn
        const state: HiveState = HiveState.fromRepresentation([
            [[B], [B], [S], [b]],
            [[], [q], [b], []],
        ], 6);
        const node: HiveNode = new HiveNode(state);

        // When computing
        const moves: HiveMove[] = moveGenerator.getListMoves(node);

        // Then there should be 5 moves (one per position where the queen bee can be dropped)
        expect(moves.length).toBe(5);
    });
});

describe('HiveHeuristic', () => {

    let heuristic: HiveHeuristic;

    beforeEach(() => {
        heuristic = new HiveHeuristic();
    });
    it('should assign a 0 value if the queen is not on the board', () => {
        // Given a state without the queen
        const state: HiveState = HiveState.getInitialState();
        const node: HiveNode = new HiveNode(state);

        // When computing its value
        const boardValue: BoardValue = heuristic.getBoardValue(node);

        // Then it should be zero
        expect(boardValue.value).toEqual(0);
    });
});

describe('HiveMinimax', () => {
    it('should create', () => {
        expect(new HiveMinimax()).toBeTruthy();
    });
});
