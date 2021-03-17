import { Player } from 'src/app/jscaip/player/Player';
import { CoerceoPartSlice, CoerceoPiece } from './CoerceoPartSlice';

describe('CoerceoPartSlice', () => {
    describe('CoerceoPiece', () => {
        describe('playerOf', () => {
            it('Should throw when called with anything else than Player.ONE or Player.ZERO', () => {
                expect(() => CoerceoPiece.ofPlayer(Player.NONE))
                    .toThrowError('CoerceoPiece.ofPlayer can only be called with Player.ZERO and Player.ONE.');
            });
        });
    });
    describe('isDeconnectable', () => {
        it('Should not deconnect full circled tile', () => {
            const slice: CoerceoPartSlice = new CoerceoPartSlice([], 0, { zero: 0, one: 0 }, { zero: 0, one: 0 });
            spyOn(slice, 'getTilesNeighboorIndexes').and.returnValue([0, 1, 2, 3, 4, 5]);
            expect(slice.isDeconnectable(null)).toBeFalse();
        });
        it('Should not deconnect splitted connection line', () => {
            const slice: CoerceoPartSlice = new CoerceoPartSlice([], 0, { zero: 0, one: 0 }, { zero: 0, one: 0 });
            spyOn(slice, 'getTilesNeighboorIndexes').and.returnValue([0, 2, 3]);
            expect(slice.isDeconnectable(null)).toBeFalse();
        });
        it('Should deconnect when 3 adjacent side (normal)', () => {
            const slice: CoerceoPartSlice = new CoerceoPartSlice([], 0, { zero: 0, one: 0 }, { zero: 0, one: 0 });
            spyOn(slice, 'getTilesNeighboorIndexes').and.returnValue([2, 3, 4]);
            expect(slice.isDeconnectable(null)).toBeTrue();
        });
        it('Should deconnect when 3 adjacent side (special)', () => {
            const slice: CoerceoPartSlice = new CoerceoPartSlice([], 0, { zero: 0, one: 0 }, { zero: 0, one: 0 });
            spyOn(slice, 'getTilesNeighboorIndexes').and.returnValue([0, 1, 5]);
            expect(slice.isDeconnectable(null)).toBeTrue();
        });
    });
});
