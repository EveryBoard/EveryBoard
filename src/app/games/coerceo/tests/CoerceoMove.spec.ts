/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoRules } from '../CoerceoRules';
import { CoerceoFailure } from '../CoerceoFailure';
import { CoerceoMove, CoerceoRegularMove, CoerceoStep, CoerceoTileExchangeMove } from '../CoerceoMove';
import { EncoderTestUtils, TestUtils } from '@everyboard/lib';
import { MoveTestUtils } from 'src/app/jscaip/tests/Move.spec';
import { CoerceoMoveGenerator } from '../CoerceoMoveGenerator';

fdescribe('CoerceoMove', () => {

    it('should distinguish move and capture based on presence or not of capture', () => {
        const move: CoerceoMove = CoerceoRegularMove.ofMovement(new Coord(5, 5), CoerceoStep.UP_RIGHT);
        expect(CoerceoMove.isTileExchange(move)).toBeFalse();
        const capture: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(6, 4));
        expect(CoerceoMove.isTileExchange(capture)).toBeTrue();
    });

    describe('fromMove', () => {

        it('should not create move of invalid distance', () => {
            function createMoveWithInvalidDistance(): void {
                CoerceoRegularMove.of(new Coord(2, 2), new Coord(9, 9));
            }
            TestUtils.expectToThrowAndLog(createMoveWithInvalidDistance, CoerceoFailure.INVALID_DISTANCE());
        });

        it('should not allow out of range landing coord', () => {
            function allowOutOfRangeLandingCoord(): void {
                CoerceoRegularMove.ofMovement(new Coord(0, 0), CoerceoStep.LEFT);
            }
            TestUtils.expectToThrowAndLog(allowOutOfRangeLandingCoord,
                                          'Landing coord cannot be out of range (width: 15, height: 10).');
        });

    });

    describe('CoerceoTileExchangeMove.of', () => {

        it('should not allow out of range capture coord', () => {
            const reason: string = 'Captured coord cannot be out of range (width: 15, height: 10).';
            function allowOutOfRangeCaptureCoord(): void {
                CoerceoTileExchangeMove.of(new Coord(-1, 16));
            }
            TestUtils.expectToThrowAndLog(allowOutOfRangeCaptureCoord, reason);
        });

    });

    describe('Overrides', () => {

        it('should have functional equals', () => {
            const a: Coord = new Coord(0, 0);
            const b: Coord = new Coord(2, 0);
            const c: Coord = new Coord(4, 0);
            const d: Coord = new Coord(1, 1);
            const tileExchange: CoerceoMove = CoerceoTileExchangeMove.of(a);
            const differentCapture: CoerceoMove = CoerceoTileExchangeMove.of(b);
            const movement: CoerceoMove = CoerceoRegularMove.of(a, b);
            const differentStart: CoerceoMove = CoerceoRegularMove.of(c, b);
            const differentEnd: CoerceoMove = CoerceoRegularMove.of(a, d);

            expect(tileExchange.equals(differentCapture)).toBeFalse();
            expect(tileExchange.equals(tileExchange)).toBeTrue();
            expect(tileExchange.equals(movement)).toBeFalse();

            expect(movement.equals(differentStart)).toBeFalse();
            expect(movement.equals(differentEnd)).toBeFalse();
            expect(movement.equals(tileExchange)).toBeFalse();
            expect(movement.equals(movement)).toBeTrue();
        });

        it('should stringify nicely', () => {
            const tileExchange: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(5, 5));
            const movement: CoerceoMove = CoerceoRegularMove.of(new Coord(5, 5), new Coord(7, 5));
            expect(tileExchange.toString()).toBe('CoerceoTileExchangeMove(5, 5)');
            expect(movement.toString()).toBe('CoerceoRegularMove((5, 5) > (7, 5))');
        });

        describe('encoder', () => {

            it('should be bijective with first turn moves', () => {
                const rules: CoerceoRules = CoerceoRules.get();
                const moveGenerator: CoerceoMoveGenerator = new CoerceoMoveGenerator();
                MoveTestUtils.testFirstTurnMovesBijectivity(rules, moveGenerator, CoerceoMove.encoder);
            });

            it('should be bijective with tiles exchanges', () => {
                const move: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(5, 7));
                EncoderTestUtils.expectToBeBijective(CoerceoMove.encoder, move);
            });

        });

    });

});
