/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoState } from '../CoerceoState';
import { CoerceoRules } from '../CoerceoRules';
import { CoerceoMinimax } from '../CoerceoMinimax';
import { CoerceoFailure } from '../CoerceoFailure';
import { CoerceoMove, CoerceoStep } from '../CoerceoMove';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';

describe('CoerceoMove', () => {

    it('Should distinguish move and capture based on presence or not of capture', () => {
        const move: CoerceoMove = CoerceoMove.fromMovement(new Coord(5, 5), CoerceoStep.UP_RIGHT);
        expect(move.isTileExchange()).toBeFalse();
        const capture: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(6, 4));
        expect(capture.isTileExchange()).toBeTrue();
    });
    describe('fromMove', () => {
        it('Should not create move of invalid distance', () => {
            expect(() => CoerceoMove.fromCoordToCoord(new Coord(2, 2), new Coord(9, 9)))
                .toThrowError(CoerceoFailure.INVALID_DISTANCE());
        });
        it('Should not allow out of range starting coord', () => {
            expect(() => CoerceoMove.fromMovement(new Coord(-1, 0), CoerceoStep.LEFT))
                .toThrowError('Starting coord cannot be out of range (width: 15, height: 10).');
        });
        it('Should not allow out of range landing coord', () => {
            expect(() => CoerceoMove.fromMovement(new Coord(0, 0), CoerceoStep.LEFT))
                .toThrowError('Landing coord cannot be out of range (width: 15, height: 10).');
        });
    });
    describe('fromTilesExchange', () => {
        it('Should not allow out of range capture coord', () => {
            const reason: string = 'Captured coord cannot be out of range (width: 15, height: 10).';
            expect(() => CoerceoMove.fromTilesExchange(new Coord(-1, 16))).toThrowError(reason);
        });
    });
    describe('Overrides', () => {
        it('should have functionnal equals', () => {
            const a: Coord = new Coord(0, 0);
            const b: Coord = new Coord(2, 0);
            const c: Coord = new Coord(4, 0);
            const d: Coord = new Coord(1, 1);
            const tileExchange: CoerceoMove = CoerceoMove.fromTilesExchange(a);
            const differentCapture: CoerceoMove = CoerceoMove.fromTilesExchange(b);
            const movement: CoerceoMove = CoerceoMove.fromCoordToCoord(a, b);
            const differentStart: CoerceoMove = CoerceoMove.fromCoordToCoord(c, b);
            const differentEnd: CoerceoMove = CoerceoMove.fromCoordToCoord(a, d);

            expect(tileExchange.equals(differentCapture)).toBeFalse();
            expect(tileExchange.equals(tileExchange)).toBeTrue();

            expect(movement.equals(differentStart)).toBeFalse();
            expect(movement.equals(differentEnd)).toBeFalse();
            expect(movement.equals(movement)).toBeTrue();
        });
        it('Should forbid non integer number to decode', () => {
            expect(() => CoerceoMove.encoder.decode(0.5)).toThrowError('EncodedMove must be an integer.');
        });
        it('should stringify nicely', () => {
            const tileExchange: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(5, 5));
            const movement: CoerceoMove = CoerceoMove.fromCoordToCoord(new Coord(5, 5), new Coord(7, 5));
            expect(tileExchange.toString()).toBe('CoerceoMove((5, 5))');
            expect(movement.toString()).toBe('CoerceoMove((5, 5) > RIGHT > (7, 5))');
        });
        describe('encoder', () => {
            it('should be correct with first turn moves', () => {
                const rules: CoerceoRules = new CoerceoRules(CoerceoState);
                const minimax: CoerceoMinimax = new CoerceoMinimax(rules, 'CoerceoMinimax');
                const moves: CoerceoMove[] = minimax.getListMoves(rules.node);
                for (const move of moves) {
                    NumberEncoderTestUtils.expectToBeCorrect(CoerceoMove.encoder, move);
                }
            });
            it('should be correct with tiles exchanges', () => {
                const move: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(5, 7));
                NumberEncoderTestUtils.expectToBeCorrect(CoerceoMove.encoder, move);
            });
        });
    });
});
