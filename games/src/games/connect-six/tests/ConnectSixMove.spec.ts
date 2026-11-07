/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from '@everyboard/lib/testing';

import { Coord } from '../../../jscaip/Coord';
import { ConnectSixMove } from '../ConnectSixMove';


describe('ConnectSixMove', () => {

    describe('ConnectSixMove with one coord', () => {

        describe('of', () => {

            it('should create move with single coord when providing list of coord with duplicates', () => {
                const move: ConnectSixMove = ConnectSixMove.of([new Coord(0, 0), new Coord(0, 0)]);
                const equivalentMove: ConnectSixMove = ConnectSixMove.of([new Coord(0, 0)]);
                expect(move.equals(equivalentMove)).toBeTrue();
            });

            it('should create move when inputs are valid', () => {
                expect(() => {
                    ConnectSixMove.of([new Coord(0, 0), new Coord(1, 1)]);
                }).not.toThrow();
            });

            it('should throw move when there is not coords', () => {
                expect(() => {
                    ConnectSixMove.of([]);
                }).toThrow();
            });

        });

        describe('equals', () => {

            it('should be equal when coords are equal', () => {
                // Given two moves with equal coords
                const first: ConnectSixMove = ConnectSixMove.of([new Coord(0, 0), new Coord(1, 1)]);
                const second: ConnectSixMove = ConnectSixMove.of([new Coord(0, 0), new Coord(1, 1)]);

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });

            it('should be different when one coord is different', () => {
                // Given two moves with different coords
                const first: ConnectSixMove = ConnectSixMove.of([new Coord(0, 0), new Coord(1, 1)]);
                const second: ConnectSixMove = ConnectSixMove.of([new Coord(0, 0), new Coord(2, 2)]);

                // When comparing them
                // Then they should be considered different
                expect(first.equals(second)).toBeFalse();
            });

            it('should consider equals two move with equals coords but different order', () => {
                // Given two moves with equal coords but switched
                const first: ConnectSixMove = ConnectSixMove.of([new Coord(0, 0), new Coord(1, 1)]);
                const second: ConnectSixMove = ConnectSixMove.of([new Coord(1, 1), new Coord(0, 0)]);

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });

        });

    });

    describe('ConnectSixMove with several coords', () => {

        describe('equals', () => {

            it('should be equal when coords are equal', () => {
                // Given two moves with equal coords
                const first: ConnectSixMove = ConnectSixMove.of([new Coord(0, 0)]);
                const second: ConnectSixMove = ConnectSixMove.of([new Coord(0, 0)]);

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });

            it('should be different when coords are different', () => {
                // Given two moves with different coords
                const first: ConnectSixMove = ConnectSixMove.of([new Coord(0, 0)]);
                const second: ConnectSixMove = ConnectSixMove.of([new Coord(1, 1)]);

                // When comparing them
                // Then they should be considered different
                expect(first.equals(second)).toBeFalse();
            });

        });

    });

    describe('encoder', () => {

        it('should be bijective', () => {
            const moves: ConnectSixMove[] = [
                ConnectSixMove.of([new Coord(0, 0)]),
                ConnectSixMove.of([new Coord(0, 0), new Coord(1, 1)]),
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(ConnectSixMove.encoder, move);
            }

        });

    });

});
