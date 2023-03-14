/* eslint-disable max-lines-per-function */

import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { HiveMove, HiveMoveSpider } from '../HiveMove';
import { HivePiece } from '../HivePiece';
import { HivePieceBehavior } from '../HivePieceBehavior';
import { HiveState } from '../HiveState';

const Q: HivePiece = new HivePiece(Player.ZERO, 'QueenBee');
const B: HivePiece = new HivePiece(Player.ZERO, 'Beetle');
const G: HivePiece = new HivePiece(Player.ZERO, 'Grasshopper');
const S: HivePiece = new HivePiece(Player.ZERO, 'Spider');
const A: HivePiece = new HivePiece(Player.ZERO, 'SoldierAnt');
const q: HivePiece = new HivePiece(Player.ONE, 'QueenBee');
const b: HivePiece = new HivePiece(Player.ONE, 'Beetle');
const g: HivePiece = new HivePiece(Player.ONE, 'Grasshopper');
const s: HivePiece = new HivePiece(Player.ONE, 'Spider');
const a: HivePiece = new HivePiece(Player.ONE, 'SoldierAnt');

describe('HivePieceBehavior', () => {
    it('should compute all possible moves for the queen bee', () => {
        // Given a state with 5 queen bee moves
        const board: Table<HivePiece[]> = [
            [[Q], [q]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 2);

        // When computing the possible moves for the queen bee
        const moves: HiveMove[] = HivePieceBehavior.from(Q).getPossibleMoves(new Coord(0, 0), state);
        // Then we should have exactly 5, as one neighbor is occupied
        expect(moves.length).toBe(5);
    });
    it('should compute all possible moves for the beetle', () => {
        // Given a state with 6 possible beetle moves
        const board: Table<HivePiece[]> = [
            [[Q], [q], [B]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 2);

        // When computing the possible moves for the beetle
        const moves: HiveMove[] = HivePieceBehavior.from(B).getPossibleMoves(new Coord(2, 0), state);
        // Then we should have exactly 6 as the beetle can climb on its neighbor
        expect(moves.length).toBe(6);
    });
    it('should compute all possible moves for the grasshopper', () => {
        // Given a state with 3 moves for the grasshopper
        const board: Table<HivePiece[]> = [
            [[Q], [q], [G], [], [A]],
            [[], [B], [B], [A], [A]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 2);

        // When computing the possible moves for the grasshopper
        const moves: HiveMove[] = HivePieceBehavior.from(G).getPossibleMoves(new Coord(2, 0), state);
        // Then we should have exactly 3 moves
        expect(moves.length).toBe(3);
    });
    it('should compute all possible moves for the spider', () => {
        // Given a state with 2 possible spider moves
        const board: Table<HivePiece[]> = [
            [[Q], [S], [], [A]],
            [[A], [], [], [G]],
            [[A], [B], [B], [q]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 4);

        // When computing the possible moves for the spider
        const moves: HiveMove[] = HivePieceBehavior.from(S).getPossibleMoves(new Coord(1, 0), state);
        // Then we should have exactly 2 moves
        expect(moves.length).toBe(2);
    });
    it('should compute all possible moves for the soldier ant', () => {
        // Given a state with 7 ant moves
        const board: Table<HivePiece[]> = [
            [[A], [q], [Q]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 4);

        // When computing the possible moves for the soldier ant
        const moves: HiveMove[] = HivePieceBehavior.from(A).getPossibleMoves(new Coord(0, 0), state);
        // Then we should have exactly 7 moves
        expect(moves.length).toBe(7);
    });
});
