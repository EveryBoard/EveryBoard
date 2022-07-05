/* eslint-disable max-lines-per-function */
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Coord } from '../Coord';
import { Direction, DirectionFailure, Orthogonal } from '../Direction';

describe('Direction', () => {

    it('should have 8 directions', () => {
        expect(Direction.DIRECTIONS.length).toBe(8);
    });
    describe('factory', () => {
        describe('of', () => {
            it('should construct a direction', () => {
                expect(Direction.factory.of(1, 0).get()).toBe(Direction.RIGHT);
                expect(Direction.factory.of(-1, 0).get()).toBe(Direction.LEFT);
                expect(Direction.factory.of(0, 1).get()).toBe(Direction.DOWN);
                expect(Direction.factory.of(0, -1).get()).toBe(Direction.UP);
                expect(Direction.factory.of(1, -1).get()).toBe(Direction.UP_RIGHT);
                expect(Direction.factory.of(-1, -1).get()).toBe(Direction.UP_LEFT);
                expect(Direction.factory.of(-1, 1).get()).toBe(Direction.DOWN_LEFT);
                expect(Direction.factory.of(1, 1).get()).toBe(Direction.DOWN_RIGHT);
            });
            it('should not construct an invalid direction', () => {
                expect(Direction.factory.of(2, 1))
                    .toEqual(MGPFallible.failure('Invalid x and y in direction construction'));
            });
        });
        describe('fromDelta', () => {
            it('should construct the directions', () => {
                expect(Direction.factory.fromDelta(3, 0).get()).toBe(Direction.RIGHT);
                expect(Direction.factory.fromDelta(-5, 0).get()).toBe(Direction.LEFT);
                expect(Direction.factory.fromDelta(1, 1).get()).toBe(Direction.DOWN_RIGHT);
            });
            it('should not construct from static move', () => {
                expect(Direction.factory.fromDelta(0, 0)).toEqual(MGPFallible.failure('Empty delta for direction'));
            });
        });
        describe('fromMove', () => {
            it('should construct a direction corresponding to a move', () => {
                expect(Direction.factory.fromMove(new Coord(0, 0), new Coord(5, 0)).get()).toBe(Direction.RIGHT);
            });
            it('should not construct when the move does not correspond to a valid direction', () => {
                const failure: MGPFallible<void> = MGPFallible.failure(DirectionFailure.DIRECTION_MUST_BE_LINEAR());
                expect(Direction.factory.fromMove(new Coord(0, 0), new Coord(5, 3))).toEqual(failure);
            });
        });
        describe('fromString', () => {
            it('should construct the direction corresponding to the string', () => {
                expect(Direction.factory.fromString('RIGHT').get()).toBe(Direction.RIGHT);
                expect(Direction.factory.fromString('LEFT').get()).toBe(Direction.LEFT);
                expect(Direction.factory.fromString('DOWN').get()).toBe(Direction.DOWN);
                expect(Direction.factory.fromString('UP').get()).toBe(Direction.UP);
                expect(Direction.factory.fromString('UP_RIGHT').get()).toBe(Direction.UP_RIGHT);
                expect(Direction.factory.fromString('UP_LEFT').get()).toBe(Direction.UP_LEFT);
                expect(Direction.factory.fromString('DOWN_LEFT').get()).toBe(Direction.DOWN_LEFT);
                expect(Direction.factory.fromString('DOWN_RIGHT').get()).toBe(Direction.DOWN_RIGHT);
            });
            it('should not construct from a string that does not correspond to a direction', () => {
                expect(Direction.factory.fromString('foo')).toEqual(MGPFallible.failure('Invalid direction string foo'));
            });
        });
        describe('fromInt', () => {
            it('should construct the direction corresponding to the int', () => {
                expect(Direction.factory.fromInt(Direction.RIGHT.toInt()).get()).toBe(Direction.RIGHT);
                expect(Direction.factory.fromInt(Direction.LEFT.toInt()).get()).toBe(Direction.LEFT);
                expect(Direction.factory.fromInt(Direction.DOWN.toInt()).get()).toBe(Direction.DOWN);
                expect(Direction.factory.fromInt(Direction.UP.toInt()).get()).toBe(Direction.UP);
                expect(Direction.factory.fromInt(Direction.UP_RIGHT.toInt()).get()).toBe(Direction.UP_RIGHT);
                expect(Direction.factory.fromInt(Direction.UP_LEFT.toInt()).get()).toBe(Direction.UP_LEFT);
                expect(Direction.factory.fromInt(Direction.DOWN_LEFT.toInt()).get()).toBe(Direction.DOWN_LEFT);
                expect(Direction.factory.fromInt(Direction.DOWN_RIGHT.toInt()).get()).toBe(Direction.DOWN_RIGHT);
            });
            it('should not construct when called with a string that does not correspond to a direction', () => {
                expect(Direction.factory.fromInt(42)).toEqual(MGPFallible.failure('Invalid int direction: 42'));
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
            expect(Direction.encoder.decode(dir)).toEqual(Direction.factory.fromString(dir).get());
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
                expect(Orthogonal.factory.of(1, 0).get()).toBe(Orthogonal.RIGHT);
                expect(Orthogonal.factory.of(-1, 0).get()).toBe(Orthogonal.LEFT);
                expect(Orthogonal.factory.of(0, 1).get()).toBe(Orthogonal.DOWN);
                expect(Orthogonal.factory.of(0, -1).get()).toBe(Orthogonal.UP);
            });
            it('should fail when constructing an invalid orthogonal', () => {
                expect(Orthogonal.factory.of(2, 1)).toEqual(MGPFallible.failure('Invalid orthogonal from x and y'));
                expect(Orthogonal.factory.of(1, 1)).toEqual(MGPFallible.failure('Invalid orthogonal from x and y'));
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
});
