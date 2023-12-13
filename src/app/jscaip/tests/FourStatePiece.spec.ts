/* eslint-disable max-lines-per-function */
import { FourStatePiece } from '../FourStatePiece';
import {Player} from "../Player";

describe('FourStatePiece', () => {
    describe('ofPlayer', () => {
        it('should return the matching piece to the given player', () => {
            // Given
            const fourStatePieceZero: FourStatePiece = FourStatePiece.ofPlayer(Player.ZERO);
            const fourStatePieceOne: FourStatePiece = FourStatePiece.ofPlayer(Player.ONE);
            // Then
            expect(fourStatePieceZero).toBe(FourStatePiece.ZERO);
            expect(fourStatePieceOne).toBe(FourStatePiece.ONE);
        });
    });
    describe('equals',() => {
        it('should a boolean by comparing the two pieces', () => {
            // Given
            const fourStatePieceZero: FourStatePiece = FourStatePiece.ZERO;
            const fourStatePieceOne: FourStatePiece = FourStatePiece.ONE;
            const fourStatePieceEmpty: FourStatePiece = FourStatePiece.EMPTY;
            const fourStatePieceUnreachable: FourStatePiece = FourStatePiece.UNREACHABLE;
            const fourStateList: FourStatePiece[]  = [fourStatePieceZero, fourStatePieceOne, fourStatePieceEmpty, fourStatePieceUnreachable];
            //Then
            for (const elem1 of fourStateList) {
                for (const elem2 of fourStateList){
                    if (elem1 === elem2) {
                        expect(elem1.equals(elem2)).toBeTrue();
                    } else {
                        expect(elem1.equals(elem2)).toBeFalse();
                    }
                }
            }

        });
    });

});
