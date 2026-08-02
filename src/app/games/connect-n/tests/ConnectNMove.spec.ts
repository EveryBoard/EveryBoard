/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from '@everyboard/lib/testing';

import { Coord } from '../../../jscaip/Coord';
import { ConnectNMove } from '../ConnectNMove';

fdescribe('ConnectNMove', () => {

    describe('ConnectNMove with one coord', () => {

        describe('of', () => {

            it('should create move with single coord when providing duplicated', () => {
                const move: ConnectNMove = ConnectNMove.of([new Coord(0, 0), new Coord(0, 0)]);
                const equivalentMove: ConnectNMove = ConnectNMove.of([new Coord(0, 0)]);
                expect(move.equals(equivalentMove)).toBeTrue();
            });

            it('should create move when inputs are valid', () => {
                expect(() => {
                    ConnectNMove.of([new Coord(0, 0), new Coord(1, 1)]);
                }).not.toThrow();
            });

        });

        describe('equals', () => {

            it('should be equal when coords are equal', () => {
                // Given two move with equal coord
                const first: ConnectNMove = ConnectNMove.of([new Coord(0, 0), new Coord(1, 1)]);
                const second: ConnectNMove = ConnectNMove.of([new Coord(0, 0), new Coord(1, 1)]);

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });

            it('should be different when one coord is different', () => {
                // Given two move with different coords
                const first: ConnectNMove = ConnectNMove.of([new Coord(0, 0), new Coord(1, 1)]);
                const second: ConnectNMove = ConnectNMove.of([new Coord(0, 0), new Coord(2, 2)]);

                // When comparing them
                // Then they should be considered different
                expect(first.equals(second)).toBeFalse();
            });

            it('should be equal when reversed, hence (a, b) == (b, a)', () => {
                // Given two move with equal coords but switched
                const first: ConnectNMove = ConnectNMove.of([new Coord(0, 0), new Coord(1, 1)]);
                const second: ConnectNMove = ConnectNMove.of([new Coord(1, 1), new Coord(0, 0)]);

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });

        });

    });

    describe('ConnectNMove with several coords', () => {

        describe('equals', () => {

            it('should be equal when coords are equal', () => {
                // Given two move with equal coord
                const first: ConnectNMove = ConnectNMove.of([new Coord(0, 0)]);
                const second: ConnectNMove = ConnectNMove.of([new Coord(0, 0)]);

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });

            it('should be different when coords are different', () => {
                // Given two move with different coord
                const first: ConnectNMove = ConnectNMove.of([new Coord(0, 0)]);
                const second: ConnectNMove = ConnectNMove.of([new Coord(1, 1)]);

                // When comparing them
                // Then they should be considered different
                expect(first.equals(second)).toBeFalse();
            });

        });

    });

    describe('encoder', () => {

        it('should be bijective', () => {
            const moves: ConnectNMove[] = [
                ConnectNMove.of([new Coord(0, 0)]),
                ConnectNMove.of([new Coord(0, 0), new Coord(1, 1)]),
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(ConnectNMove.encoder, move);
            }

        });

    });

});
