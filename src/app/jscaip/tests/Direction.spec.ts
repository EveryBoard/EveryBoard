import { Coord } from '../Coord';
import { Direction, Orthogonal } from '../Direction';

describe('Direction', () => {
    it('should have 8 directions', () => {
        expect(Direction.DIRECTIONS.length).toBe(8);
    });
    describe('factory', () => {
        describe('of', () => {
            it('should construct a direction', () => {
                expect(Direction.factory.of(1, 0)).toBe(Direction.RIGHT);
                expect(Direction.factory.of(-1, 0)).toBe(Direction.LEFT);
                expect(Direction.factory.of(0, 1)).toBe(Direction.DOWN);
                expect(Direction.factory.of(0, -1)).toBe(Direction.UP);
                expect(Direction.factory.of(1, -1)).toBe(Direction.UP_RIGHT);
                expect(Direction.factory.of(-1, -1)).toBe(Direction.UP_LEFT);
                expect(Direction.factory.of(-1, 1)).toBe(Direction.DOWN_LEFT);
                expect(Direction.factory.of(1, 1)).toBe(Direction.DOWN_RIGHT);
            });
            it('should fail when constructing an invalid direction', () => {
                expect(() => Direction.factory.of(2, 1)).toThrow();
            });
        });
        describe('fromDelta', () => {
            it('should construct the directions', () => {
                expect(Direction.factory.fromDelta(3, 0)).toBe(Direction.RIGHT);
                expect(Direction.factory.fromDelta(-5, 0)).toBe(Direction.LEFT);
                expect(Direction.factory.fromDelta(1, 1)).toBe(Direction.DOWN_RIGHT);
            });
            it('should throw when trying static move', () => {
                expect(() => Direction.factory.fromDelta(0, 0)).toThrowError('Invalid direction from static move');
            });
        });
        describe('fromMove', () => {
            it('should construct a direction corresponding to a move', () => {
                expect(Direction.factory.fromMove(new Coord(0, 0), new Coord(5, 0))).toBe(Direction.RIGHT);
            });
            it('should throw when the move does not correspond to a valid direction', () => {
                expect(() => Direction.factory.fromMove(new Coord(0, 0), new Coord(5, 3))).toThrow();
            });
        });
        describe('fromString', () => {
            it('should construct the direction corresponding to the string', () => {
                expect(Direction.factory.fromString('RIGHT')).toBe(Direction.RIGHT);
                expect(Direction.factory.fromString('LEFT')).toBe(Direction.LEFT);
                expect(Direction.factory.fromString('DOWN')).toBe(Direction.DOWN);
                expect(Direction.factory.fromString('UP')).toBe(Direction.UP);
                expect(Direction.factory.fromString('UP_RIGHT')).toBe(Direction.UP_RIGHT);
                expect(Direction.factory.fromString('UP_LEFT')).toBe(Direction.UP_LEFT);
                expect(Direction.factory.fromString('DOWN_LEFT')).toBe(Direction.DOWN_LEFT);
                expect(Direction.factory.fromString('DOWN_RIGHT')).toBe(Direction.DOWN_RIGHT);
            });
            it('should throw when called with a string that does not correspond to a direction', () => {
                expect(() => Direction.factory.fromString('foo')).toThrow();
            });
        });
        describe('fromInt', () => {
            it('should construct the direction corresponding to the int', () => {
                expect(Direction.factory.fromInt(Direction.RIGHT.toInt())).toBe(Direction.RIGHT);
                expect(Direction.factory.fromInt(Direction.LEFT.toInt())).toBe(Direction.LEFT);
                expect(Direction.factory.fromInt(Direction.DOWN.toInt())).toBe(Direction.DOWN);
                expect(Direction.factory.fromInt(Direction.UP.toInt())).toBe(Direction.UP);
                expect(Direction.factory.fromInt(Direction.UP_RIGHT.toInt())).toBe(Direction.UP_RIGHT);
                expect(Direction.factory.fromInt(Direction.UP_LEFT.toInt())).toBe(Direction.UP_LEFT);
                expect(Direction.factory.fromInt(Direction.DOWN_LEFT.toInt())).toBe(Direction.DOWN_LEFT);
                expect(Direction.factory.fromInt(Direction.DOWN_RIGHT.toInt())).toBe(Direction.DOWN_RIGHT);
            });
            it('should throw when called with a string that does not correspond to a direction', () => {
                expect(() => Direction.factory.fromInt(42)).toThrow();
            });
        });
    });
    describe('getOpposite', () => {
        it('should return the opposite direction', () => {
            expect(Direction.RIGHT.getOpposite()).toBe(Direction.LEFT);
            expect(Direction.LEFT.getOpposite()).toBe(Direction.RIGHT);
            expect(Direction.DOWN.getOpposite()).toBe(Direction.UP);
            expect(Direction.UP.getOpposite()).toBe(Direction.DOWN);
            expect(Direction.UP_RIGHT.getOpposite()).toBe(Direction.DOWN_LEFT);
            expect(Direction.UP_LEFT.getOpposite()).toBe(Direction.DOWN_RIGHT);
            expect(Direction.DOWN_LEFT.getOpposite()).toBe(Direction.UP_RIGHT);
            expect(Direction.DOWN_RIGHT.getOpposite()).toBe(Direction.UP_LEFT);
        });
    });
    describe('isDown', () => {
        it('should consider the DOWN direction to be down', () => {
            expect(Direction.DOWN.isDown()).toBeTrue();
        });
        it('should consider non-DOWN directions not to be down', () => {
            expect(Direction.LEFT.isDown()).toBeFalse();
            expect(Direction.UP.isDown()).toBeFalse();
        });
    });
    describe('isUp', () => {
        it('should consider the UP direction to be up', () => {
            expect(Direction.UP.isUp()).toBeTrue();
        });
        it('should consider non-UP directions not to be up', () => {
            expect(Direction.LEFT.isUp()).toBeFalse();
            expect(Direction.DOWN.isUp()).toBeFalse();
        });
    });
    describe('isLeft', () => {
        it('should consider the LEFT direction to be left', () => {
            expect(Direction.LEFT.isLeft()).toBeTrue();
        });
        it('should consider non-LEFT directions not to be left', () => {
            expect(Direction.DOWN.isLeft()).toBeFalse();
            expect(Direction.RIGHT.isLeft()).toBeFalse();
        });
    });
    describe('isRight', () => {
        it('should consider the RIGHT direction to be right', () => {
            expect(Direction.RIGHT.isRight()).toBeTrue();
        });
        it('should consider non-RIGHT directions not to be right', () => {
            expect(Direction.DOWN.isRight()).toBeFalse();
            expect(Direction.LEFT.isRight()).toBeFalse();
        });
    });
    describe('equals', () => {
        it('should consider a direction equal to itself', () => {
            expect(Direction.UP.equals(Direction.UP)).toBeTrue();
        });
        it('should distinguish different directions', () => {
            expect(Direction.UP.equals(Direction.DOWN)).toBeFalse();
        });
    });
    describe('Encoder', () => {
        it('should encode by calling Direction.toString', () => {
            const dir: Direction = Direction.DOWN;
            expect(Direction.encoder.encode(dir)).toEqual(dir.toString());
        });
        it('should decode by calling Direction.factory.fromString', () => {
            const dir: string = Direction.DOWN.toString();
            expect(Direction.encoder.decode(dir)).toEqual(Direction.factory.fromString(dir));
        });
    });
});

describe('Orthogonal', () => {
    it('should have 4 directions', () => {
        expect(Orthogonal.ORTHOGONALS.length).toBe(4);
    });
    describe('factory', () => {
        describe('of', () => {
            it('should construct a direction', () => {
                expect(Orthogonal.factory.of(1, 0)).toBe(Orthogonal.RIGHT);
                expect(Orthogonal.factory.of(-1, 0)).toBe(Orthogonal.LEFT);
                expect(Orthogonal.factory.of(0, 1)).toBe(Orthogonal.DOWN);
                expect(Orthogonal.factory.of(0, -1)).toBe(Orthogonal.UP);
            });
            it('should fail when constructing an invalid direction', () => {
                expect(() => Orthogonal.factory.of(2, 1)).toThrow();
                expect(() => Orthogonal.factory.of(1, 1)).toThrow();
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
            expect(Orthogonal.encoder.decode(dir)).toEqual(Orthogonal.factory.fromString(dir));
        });
    });
});
