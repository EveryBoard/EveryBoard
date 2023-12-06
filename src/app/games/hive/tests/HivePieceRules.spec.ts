/* eslint-disable max-lines-per-function */

import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPValidation } from '../../../utils/MGPValidation';
import { HiveMove } from '../HiveMove';
import { HivePiece } from '../HivePiece';
import { HivePieceRules, HiveSpiderRules } from '../HivePieceRules';
import { HiveRules } from '../HiveRules';
import { HiveState } from '../HiveState';

const Q: HivePiece = new HivePiece(Player.ZERO, 'QueenBee');
const B: HivePiece = new HivePiece(Player.ZERO, 'Beetle');
const G: HivePiece = new HivePiece(Player.ZERO, 'Grasshopper');
const S: HivePiece = new HivePiece(Player.ZERO, 'Spider');
const A: HivePiece = new HivePiece(Player.ZERO, 'SoldierAnt');
const q: HivePiece = new HivePiece(Player.ONE, 'QueenBee');

describe('HivePieceRules', () => {

    it('should compute all possible moves for the queen bee', () => {
        // Given a state with 5 queen bee moves
        const board: Table<HivePiece[]> = [
            [[Q], [q]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 2);

        // When computing the possible moves for the queen bee
        const moves: HiveMove[] = HivePieceRules.of(Q).getPotentialMoves(new Coord(0, 0), state);
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
        const moves: HiveMove[] = HivePieceRules.of(B).getPotentialMoves(new Coord(2, 0), state);
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
        const moves: HiveMove[] = HivePieceRules.of(G).getPotentialMoves(new Coord(2, 0), state);
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
        const moves: HiveMove[] = HivePieceRules.of(S).getPotentialMoves(new Coord(1, 0), state);
        // Then we should have exactly 2 moves
        expect(moves.length).toBe(2);
    });

    it('should take offset into account in spider prefixLegality', () => {
        // Given a state with a spider of which the move would create an offset
        const board: Table<HivePiece[]> = [
            [[], [], [S]],
            [[], [q], []],
            [[], [Q], []],
            [[B], [], []],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 4);
        // When checking the legality of a legal move prefix
        const prefix: Coord[] = [new Coord(2, 0), new Coord(1, 0)];
        const legality: MGPValidation = HiveSpiderRules.get().prefixLegality(prefix, state);
        // Then it should have taken the offset into account and produce the expected result
        expect(legality.isSuccess()).toBeTrue();
    });

    it('should take offset into account in spider possible moves', () => {
        // Given a state with a spider of which the move would create an offset
        const board: Table<HivePiece[]> = [
            [[], [], [S]],
            [[], [q], []],
            [[], [Q], []],
            [[B], [], []],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 4);
        // When computing the possible moves for that spider
        const moves: HiveMove[] = HivePieceRules.of(S).getPotentialMoves(new Coord(2, 0), state);
        // Then it should compute the expected moves (here, 2)
        expect(moves.length).toBe(2);
        // and they should both be legal (hence, without the offset)
        for (const move of moves) {
            const legality: MGPValidation = HiveRules.get().isLegal(move, state);
            expect(legality.isSuccess()).toBeTrue();
        }
    });

    it('should compute all possible moves for the soldier ant', () => {
        // Given a state with 7 ant moves
        const board: Table<HivePiece[]> = [
            [[A], [q], [Q]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 4);

        // When computing the possible moves for the soldier ant
        const moves: HiveMove[] = HivePieceRules.of(A).getPotentialMoves(new Coord(0, 0), state);
        // Then we should have exactly 7 moves
        expect(moves.length).toBe(7);
    });

});
