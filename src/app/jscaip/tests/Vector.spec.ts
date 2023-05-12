import { Vector } from '../Vector';

describe('Vector', () => {
    it('should vectorise correctly', () => {
        const c: Vector = new Vector(3, -11);
        expect(c.toMinimalVector()).toEqual(new Vector(3, -11));

        const c0: Vector = new Vector(4, -8);
        expect(c0.toMinimalVector()).toEqual(new Vector(1, -2));

        const c1: Vector = new Vector(-3, -9);
        expect(c1.toMinimalVector()).toEqual(new Vector(-1, -3));
    });
});
