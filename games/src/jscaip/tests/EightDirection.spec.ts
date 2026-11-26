/* eslint-disable max-lines-per-function */
import { MGPFallible, MGPValidation } from '@everyboard/lib';

import { Coord } from '../Coord';
import { DirectionFactory, DirectionFailure } from '../direction/Direction';
import { EightDirection } from '../direction/EightDirection';

describe('EightDirection', () => {

    it('should have 8 directions', () => {
        expect(EightDirection.EIGHT_DIRECTIONS.length).toBe(8);
    });
    describe('factory', () => {
        describe('of', () => {
            it('should construct a direction', () => {
                expect(EightDirection.factory.from(1, 0).get()).toBe(EightDirection.RIGHT);
                expect(EightDirection.factory.from(-1, 0).get()).toBe(EightDirection.LEFT);
                expect(EightDirection.factory.from(0, 1).get()).toBe(EightDirection.DOWN);
                expect(EightDirection.factory.from(0, -1).get()).toBe(EightDirection.UP);
                expect(EightDirection.factory.from(1, -1).get()).toBe(EightDirection.UP_RIGHT);
                expect(EightDirection.factory.from(-1, -1).get()).toBe(EightDirection.UP_LEFT);
                expect(EightDirection.factory.from(-1, 1).get()).toBe(EightDirection.DOWN_LEFT);
                expect(EightDirection.factory.from(1, 1).get()).toBe(EightDirection.DOWN_RIGHT);
            });
            it('should not construct an invalid direction', () => {
                expect(EightDirection.factory.from(2, 1))
                    .toEqual(MGPFallible.failure('Invalid x or y in direction construction'));
            });
        });
        describe('fromDelta', () => {
            it('should construct the directions', () => {
                expect(EightDirection.factory.fromDelta(3, 0).get()).toBe(EightDirection.RIGHT);
                expect(EightDirection.factory.fromDelta(-5, 0).get()).toBe(EightDirection.LEFT);
                expect(EightDirection.factory.fromDelta(1, 1).get()).toBe(EightDirection.DOWN_RIGHT);
            });
            it('should not construct from static move', () => {
                expect(EightDirection.factory.fromDelta(0, 0)).toEqual(MGPFallible.failure('Empty delta for direction'));
            });
        });
        describe('fromMove', () => {
            it('should construct a direction corresponding to a move', () => {
                const eightDirection: EightDirection =
                    EightDirection.factory.fromMove(new Coord(0, 0), new Coord(5, 0)).get();
                expect(eightDirection).toBe(EightDirection.RIGHT);
            });
            it('should not construct when the move does not correspond to a valid direction', () => {
                const failure: MGPValidation = MGPValidation.failure(DirectionFailure.DIRECTION_MUST_BE_LINEAR());
                expect(EightDirection.factory.fromMove(new Coord(0, 0), new Coord(5, 3))).toEqual(failure);
            });
        });
        describe('fromString', () => {
            it('should construct the direction corresponding to the string', () => {
                expect(EightDirection.factory.fromString('RIGHT').get()).toBe(EightDirection.RIGHT);
                expect(EightDirection.factory.fromString('LEFT').get()).toBe(EightDirection.LEFT);
                expect(EightDirection.factory.fromString('DOWN').get()).toBe(EightDirection.DOWN);
                expect(EightDirection.factory.fromString('UP').get()).toBe(EightDirection.UP);
                expect(EightDirection.factory.fromString('UP_RIGHT').get()).toBe(EightDirection.UP_RIGHT);
                expect(EightDirection.factory.fromString('UP_LEFT').get()).toBe(EightDirection.UP_LEFT);
                expect(EightDirection.factory.fromString('DOWN_LEFT').get()).toBe(EightDirection.DOWN_LEFT);
                expect(EightDirection.factory.fromString('DOWN_RIGHT').get()).toBe(EightDirection.DOWN_RIGHT);
            });
            it('should not construct from a string that does not correspond to a direction', () => {
                expect(EightDirection.factory.fromString('foo')).toEqual(MGPFallible.failure('Invalid direction string foo'));
            });
        });
        describe('fromInt', () => {

            it('should construct the direction corresponding to the int', () => {
                const factory: DirectionFactory<EightDirection> = EightDirection.factory;
                expect(factory.fromInt(EightDirection.RIGHT.toInt()).get()).toBe(EightDirection.RIGHT);
                expect(factory.fromInt(EightDirection.LEFT.toInt()).get()).toBe(EightDirection.LEFT);
                expect(factory.fromInt(EightDirection.DOWN.toInt()).get()).toBe(EightDirection.DOWN);
                expect(factory.fromInt(EightDirection.UP.toInt()).get()).toBe(EightDirection.UP);
                expect(factory.fromInt(EightDirection.UP_RIGHT.toInt()).get()).toBe(EightDirection.UP_RIGHT);
                expect(factory.fromInt(EightDirection.UP_LEFT.toInt()).get()).toBe(EightDirection.UP_LEFT);
                expect(factory.fromInt(EightDirection.DOWN_LEFT.toInt()).get()).toBe(EightDirection.DOWN_LEFT);
                expect(factory.fromInt(EightDirection.DOWN_RIGHT.toInt()).get()).toBe(EightDirection.DOWN_RIGHT);
            });

            it('should not construct when called with a string that does not correspond to a direction', () => {
                expect(EightDirection.factory.fromInt(42)).toEqual(MGPFallible.failure('Invalid int direction: 42'));
            });
        });
    });
    describe('getOpposite', () => {
        it('should return the opposite direction', () => {
            expect(EightDirection.RIGHT.getOpposite()).toBe(EightDirection.LEFT);
            expect(EightDirection.LEFT.getOpposite()).toBe(EightDirection.RIGHT);
            expect(EightDirection.DOWN.getOpposite()).toBe(EightDirection.UP);
            expect(EightDirection.UP.getOpposite()).toBe(EightDirection.DOWN);
            expect(EightDirection.UP_RIGHT.getOpposite()).toBe(EightDirection.DOWN_LEFT);
            expect(EightDirection.UP_LEFT.getOpposite()).toBe(EightDirection.DOWN_RIGHT);
            expect(EightDirection.DOWN_LEFT.getOpposite()).toBe(EightDirection.UP_RIGHT);
            expect(EightDirection.DOWN_RIGHT.getOpposite()).toBe(EightDirection.UP_LEFT);
        });
    });
    describe('isDown', () => {
        it('should consider the DOWN direction to be down', () => {
            expect(EightDirection.DOWN.isDown()).toBeTrue();
        });
        it('should consider non-DOWN directions not to be down', () => {
            expect(EightDirection.LEFT.isDown()).toBeFalse();
            expect(EightDirection.UP.isDown()).toBeFalse();
        });
    });
    describe('isUp', () => {
        it('should consider the UP direction to be up', () => {
            expect(EightDirection.UP.isUp()).toBeTrue();
        });
        it('should consider non-UP directions not to be up', () => {
            expect(EightDirection.LEFT.isUp()).toBeFalse();
            expect(EightDirection.DOWN.isUp()).toBeFalse();
        });
    });
    describe('isLeft', () => {
        it('should consider the LEFT direction to be left', () => {
            expect(EightDirection.LEFT.isLeft()).toBeTrue();
        });
        it('should consider non-LEFT directions not to be left', () => {
            expect(EightDirection.DOWN.isLeft()).toBeFalse();
            expect(EightDirection.RIGHT.isLeft()).toBeFalse();
        });
    });
    describe('isRight', () => {
        it('should consider the RIGHT direction to be right', () => {
            expect(EightDirection.RIGHT.isRight()).toBeTrue();
        });
        it('should consider non-RIGHT directions not to be right', () => {
            expect(EightDirection.DOWN.isRight()).toBeFalse();
            expect(EightDirection.LEFT.isRight()).toBeFalse();
        });
    });
    describe('equals', () => {
        it('should consider a direction equal to itself', () => {
            expect(EightDirection.UP.equals(EightDirection.UP)).toBeTrue();
        });
        it('should distinguish different directions', () => {
            expect(EightDirection.UP.equals(EightDirection.DOWN)).toBeFalse();
        });
    });
    describe('Encoder', () => {
        it('should encode by calling Direction.toString', () => {
            const dir: EightDirection = EightDirection.DOWN;
            expect(EightDirection.encoder.encode(dir)).toEqual(dir.toString());
        });
        it('should decode by calling Direction.factory.fromString', () => {
            const dir: string = EightDirection.DOWN.toString();
            expect(EightDirection.encoder.decode(dir)).toEqual(EightDirection.factory.fromString(dir).get());
        });
    });
    it('should map to angle by multiple of 45', () => {
        for (let i: number = 0; i < 8; i++) {
            const dir: EightDirection = EightDirection.factory.all[i];
            expect(dir.getAngle()).toBe(i * 45);
        }
    });

});
