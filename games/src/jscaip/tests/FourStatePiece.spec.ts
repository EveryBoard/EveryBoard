/* eslint-disable max-lines-per-function */
import { FourStatePiece } from '../FourStatePiece';
import { Player } from '../Player';

describe('FourStatePiece', () => {
    describe('ofPlayer', () => {
        it('should return the matching piece to the given player', () => {
            // Given a player
            // When passed to ofPlayer()
            const fourStatePieceZero: FourStatePiece = FourStatePiece.ofPlayer(Player.ZERO);
            const fourStatePieceOne: FourStatePiece = FourStatePiece.ofPlayer(Player.ONE);
            // Then the resulting fourStatePiece should correspond
            expect(fourStatePieceZero).toBe(FourStatePiece.ZERO);
            expect(fourStatePieceOne).toBe(FourStatePiece.ONE);
        });
    });
    describe('equals', () => {
        it('should a boolean by comparing the two pieces', () => {
            // Given a list of all fourStatePiece
            const zero: FourStatePiece = FourStatePiece.ZERO;
            const one: FourStatePiece = FourStatePiece.ONE;
            const empty: FourStatePiece = FourStatePiece.EMPTY;
            const unreachable: FourStatePiece = FourStatePiece.UNREACHABLE;
            const fourStateList: FourStatePiece[] = [zero, one, empty, unreachable];
            // When comparing them together
            // Then none of them should correspond except themselves
            for (let i: number = 0; i < 4; i++) {
                for (let j: number = 0; j < 4; j++) {
                    const left: FourStatePiece = fourStateList[i];
                    const right: FourStatePiece = fourStateList[j];
                    if (i === j) {
                        expect(left.equals(right)).toBeTrue();
                    } else {
                        expect(left.equals(right)).toBeFalse();
                    }
                }
            }

        });
    });

});
