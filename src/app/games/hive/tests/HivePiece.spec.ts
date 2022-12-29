/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { HivePiece, HivePieceBeetle, HivePieceGrasshopper, HivePieceQueenBee, HivePieceSoldierAnt, HivePieceSpider } from '../HivePiece';
import { HiveState } from '../HiveState';

fdescribe('HivePiece', () => {
    const Q: HivePiece = new HivePieceQueenBee(Player.ZERO);
    const B: HivePiece = new HivePieceBeetle(Player.ZERO);
    const G: HivePiece = new HivePieceGrasshopper(Player.ZERO);
    const S: HivePiece = new HivePieceSpider(Player.ZERO);
    const A: HivePiece = new HivePieceSoldierAnt(Player.ZERO);
    const q: HivePiece = new HivePieceQueenBee(Player.ONE);

    it('should define toString', () => {
        expect(Q.toString()).toEqual('QueenBee_PLAYER_ZERO');
    });
    it('should define equality', () => {
        expect(Q.equals(Q)).toBeTrue();
        expect(Q.equals(q)).toBeFalse();
        expect(Q.equals(B)).toBeFalse();
    });
    it('should compute all possible moves for the queen bee', () => {
        // Given a state
        const board: Table<HivePiece[]> = [
            [[Q], [q]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 2);

        // When computing the possible moves for the queen bee
        // Then we should have exactly 5, as one neighbor is occupied
        expect(Q.getPossibleMoves(new Coord(0, 0), state).length).toBe(5);
    });
    it('should compute all possible moves for the beetle', () => {
        // Given a state
        const board: Table<HivePiece[]> = [
            [[Q], [q], [B]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 2);

        // When computing the possible moves for the beetle
        // Then we should have exactly 6 as the beetle can climb on its neighbor
        expect(B.getPossibleMoves(new Coord(2, 0), state).length).toBe(6);
    });
    it('should compute all possible moves for the grasshopper', () => {
        // Given a state
        const board: Table<HivePiece[]> = [
            [[Q], [q], [G], [], [A]],
            [[], [B], [B], [A], [A]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 2);

        // When computing the possible moves for the grasshopper
        // Then we should have exactly 3 moves
        expect(G.getPossibleMoves(new Coord(2, 0), state).length).toBe(3);
    });
    fit('should compute all possible moves for the spider', () => {
        // Given a state
        const board: Table<HivePiece[]> = [
            [[Q], [S], [], [A]],
            [[A], [], [], [G]],
            [[A], [B], [B], [q]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 4);

        // When computing the possible moves for the spider
        // Then we should have exactly 2 moves
        for (const move of S.getPossibleMoves(new Coord(1, 0), state)) {
            console.log(move.toString())
        }
        expect(S.getPossibleMoves(new Coord(1, 0), state).length).toBe(2);
    });
    it('should compute all possible moves for the soldier ant', () => {
        // Given a state
        const board: Table<HivePiece[]> = [
            [[A], [q], [Q]],
        ];
        const state: HiveState = HiveState.fromRepresentation(board, 4);

        // When computing the possible moves for the soldier ant
        // Then we should have exactly 7 moves
        expect(A.getPossibleMoves(new Coord(0, 0), state).length).toBe(7);
    });
});
