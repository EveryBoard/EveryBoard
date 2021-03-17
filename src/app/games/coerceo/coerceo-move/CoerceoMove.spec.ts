import { Coord } from 'src/app/jscaip/coord/Coord';
import { Vector } from 'src/app/jscaip/DIRECTION';
import { CoerceoFailure } from '../coerceo-rules/CoerceoRules';
import { CoerceoMove, CoerceoStep } from './CoerceoMove';

describe('CoerceoMove', () => {
    it('Should distinguish move and capture based on presence or not of capture', () => {
        const move: CoerceoMove = CoerceoMove.fromMove(new Coord(5, 5), CoerceoStep.UP_RIGHT);
        expect(move.isTileExchange()).toBeFalse();
        const capture: CoerceoMove = CoerceoMove.fromTilesExchange(new Coord(6, 4));
        expect(capture.isTileExchange()).toBeTrue();
    });
    describe('fromMove', () => {
        it('Should not create move with nulls values', () => {
            expect(() => CoerceoMove.fromMove(new Coord(2, 2), null))
                .toThrowError('Step cannot be null.');
        });
        it('Should not create move of invalid distance', () => {
            expect(() => CoerceoMove.fromMove(new Coord(2, 2), { direction: new Vector(1, 1) }))
                .toThrowError(CoerceoFailure.INVALID_DISTANCE);
        });
        it('Should not allow out-of range starting coord', () => {
            expect(() => CoerceoMove.fromMove(new Coord(-1, 0), CoerceoStep.LEFT))
                .toThrowError('Starting coord cannot be out of range (width: 15, height: 10).');
        });
        it('Should not allow out-of range landing coord', () => {
            expect(() => CoerceoMove.fromMove(new Coord(0, 0), CoerceoStep.LEFT))
                .toThrowError('Landing coord cannot be out of range (width: 15, height: 10).');
        });
    });
    describe('fromTilesExchange', () => {

    });
});
