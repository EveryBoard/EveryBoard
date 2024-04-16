import { MGPFallible } from '@everyboard/lib';
import { Orthogonal } from '../Orthogonal';

describe('Orthogonal', () => {

    it('should have 4 directions', () => {
        expect(Orthogonal.ORTHOGONALS.length).toBe(4);
    });
    describe('factory', () => {
        describe('of', () => {
            it('should construct a direction', () => {
                expect(Orthogonal.factory.from(1, 0).get()).toBe(Orthogonal.RIGHT);
                expect(Orthogonal.factory.from(-1, 0).get()).toBe(Orthogonal.LEFT);
                expect(Orthogonal.factory.from(0, 1).get()).toBe(Orthogonal.DOWN);
                expect(Orthogonal.factory.from(0, -1).get()).toBe(Orthogonal.UP);
            });
            it('should fail when constructing an invalid orthogonal', () => {
                expect(Orthogonal.factory.from(2, 1)).toEqual(MGPFallible.failure('Invalid orthogonal from x and y'));
                expect(Orthogonal.factory.from(1, 1)).toEqual(MGPFallible.failure('Invalid orthogonal from x and y'));
            });
        });
    });
    describe('Encoder', () => {
        it('should encode by calling Orthogonal.toString', () => {
            const dir: Orthogonal = Orthogonal.DOWN;
            expect(Orthogonal.encoder.encode(dir)).toEqual(dir.toString());
        });
        it('should decode by calling Orthogonal.factory.fromString', () => {
            const dir: string = Orthogonal.DOWN.toString();
            expect(Orthogonal.encoder.decode(dir)).toEqual(Orthogonal.factory.fromString(dir).get());
        });
    });
    describe('rotateClockwise', () => {
        it('should rotate clockwise for each direction', () => {
            expect(Orthogonal.LEFT.rotateClockwise()).toBe(Orthogonal.UP);
            expect(Orthogonal.UP.rotateClockwise()).toBe(Orthogonal.RIGHT);
            expect(Orthogonal.RIGHT.rotateClockwise()).toBe(Orthogonal.DOWN);
            expect(Orthogonal.DOWN.rotateClockwise()).toBe(Orthogonal.LEFT);
        });
    });
    it('should map to angle by multiple of 90', () => {
        for (let i: number = 0; i < 4; i++) {
            const dir: Orthogonal = Orthogonal.factory.all[i];
            expect(dir.getAngle()).toBe(i * 90);
        }
    });
});
