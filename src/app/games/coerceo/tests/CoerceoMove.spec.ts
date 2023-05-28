/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoNode, CoerceoRules } from '../CoerceoRules';
import { CoerceoMinimax } from '../CoerceoMinimax';
import { CoerceoFailure } from '../CoerceoFailure';
import { CoerceoMove, CoerceoMoveEncoder, CoerceoNormalMove, CoerceoStep, CoerceoTileExchangeMove } from '../CoerceoMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';

describe('CoerceoMove', () => {

    it('should distinguish move and capture based on presence or not of capture', () => {
        const move: CoerceoMove = CoerceoNormalMove.fromMovement(new Coord(5, 5), CoerceoStep.UP_RIGHT);
        expect(move.isTileExchange()).toBeFalse();
        const capture: CoerceoMove = CoerceoTileExchangeMove.from(new Coord(6, 4)).get();
        expect(capture.isTileExchange()).toBeTrue();
    });
    describe('fromMove', () => {
        it('should not create move of invalid distance', () => {
            function createMoveWithInvalidDistance(): void {
                CoerceoNormalMove.from(new Coord(2, 2), new Coord(9, 9));
            }
            RulesUtils.expectToThrowAndLog(createMoveWithInvalidDistance, CoerceoFailure.INVALID_DISTANCE());
        });
        it('should not allow out of range starting coord', () => {
            function createOutOfRangeStartingCoord(): void {
                CoerceoNormalMove.fromMovement(new Coord(-1, 0), CoerceoStep.LEFT);
            }
            RulesUtils.expectToThrowAndLog(createOutOfRangeStartingCoord,
                                           'Starting coord cannot be out of range (width: 15, height: 10).');
        });
        it('should not allow out of range landing coord', () => {
            function allowOutOfRangeLandingCoord(): void {
                CoerceoNormalMove.fromMovement(new Coord(0, 0), CoerceoStep.LEFT);
            }
            RulesUtils.expectToThrowAndLog(allowOutOfRangeLandingCoord,
                                           'Landing coord cannot be out of range (width: 15, height: 10).');
        });
    });
    describe('fromTilesExchange', () => {
        it('should not allow out of range capture coord', () => {
            const reason: string = 'Captured coord cannot be out of range (width: 15, height: 10).';
            function allowOutOfRangeCaptureCoord(): void {
                CoerceoTileExchangeMove.from(new Coord(-1, 16));
            }
            RulesUtils.expectToThrowAndLog(allowOutOfRangeCaptureCoord, reason);
        });
    });
    describe('Overrides', () => {
        it('should have functional equals', () => {
            const a: Coord = new Coord(0, 0);
            const b: Coord = new Coord(2, 0);
            const c: Coord = new Coord(4, 0);
            const d: Coord = new Coord(1, 1);
            const tileExchange: CoerceoMove = CoerceoTileExchangeMove.from(a).get();
            const differentCapture: CoerceoMove = CoerceoTileExchangeMove.from(b).get();
            const movement: CoerceoMove = CoerceoNormalMove.from(a, b).get();
            const differentStart: CoerceoMove = CoerceoNormalMove.from(c, b).get();
            const differentEnd: CoerceoMove = CoerceoNormalMove.from(a, d).get();

            expect(tileExchange.equals(differentCapture)).toBeFalse();
            expect(tileExchange.equals(tileExchange)).toBeTrue();

            expect(movement.equals(differentStart)).toBeFalse();
            expect(movement.equals(differentEnd)).toBeFalse();
            expect(movement.equals(tileExchange)).toBeFalse();
            expect(movement.equals(movement)).toBeTrue();
        });
        it('should stringify nicely', () => {
            const tileExchange: CoerceoMove = CoerceoTileExchangeMove.from(new Coord(5, 5)).get();
            const movement: CoerceoMove = CoerceoNormalMove.from(new Coord(5, 5), new Coord(7, 5)).get();
            expect(tileExchange.toString()).toBe('CoerceoTileExchangeMove(5, 5)');
            expect(movement.toString()).toBe('CoerceoNormalMove((5, 5) > (7, 5))');
        });
        describe('encoder', () => {
            it('should be bijective with first turn moves', () => {
                const rules: CoerceoRules = CoerceoRules.get();
                const minimax: CoerceoMinimax = new CoerceoMinimax(rules, 'CoerceoMinimax');
                const node: CoerceoNode = rules.getInitialNode();
                const moves: CoerceoMove[] = minimax.getListMoves(node);
                for (const move of moves) {
                    EncoderTestUtils.expectToBeBijective(CoerceoMoveEncoder, move);
                }
            });
            it('should be bijective with tiles exchanges', () => {
                const move: CoerceoMove = CoerceoTileExchangeMove.from(new Coord(5, 7)).get();
                EncoderTestUtils.expectToBeBijective(CoerceoMoveEncoder, move);
            });
        });
    });
});
