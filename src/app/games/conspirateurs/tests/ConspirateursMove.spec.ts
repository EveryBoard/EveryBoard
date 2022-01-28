/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ConspirateursFailure } from '../ConspirateursFailure';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveEncoder, ConspirateursMoveJump, ConspirateursMoveSimple } from '../ConspirateursMove';

describe('ConspirateursMove', () => {
    function drop(target: Coord): ConspirateursMoveDrop {
        return ConspirateursMoveDrop.of(target).get();
    }
    function simpleMove(start: Coord, end: Coord): ConspirateursMoveSimple {
        return ConspirateursMoveSimple.of(start, end).get();
    }
    function jump(coords: Coord[]): ConspirateursMoveJump {
        return ConspirateursMoveJump.of(coords).get();
    }
    describe('drop', () => {
        const move: ConspirateursMoveDrop = drop(new Coord(7, 7));
        it('should redefine equality', () => {
            const otherDrop: ConspirateursMoveDrop = drop(new Coord(8, 8));
            const notADrop: ConspirateursMove = simpleMove(new Coord(7, 7), new Coord(7, 6));
            expect(move.equals(move)).toBeTrue();
            expect(move.equals(otherDrop)).toBeFalse();
            expect(move.equals(notADrop)).toBeFalse();
        });
        it('should redefine toString for drops', () => {
            expect(move.toString()).toBe('ConspirateursMoveDrop((7, 7))');
        });
        it('should redefine type checks for drops', () => {
            expect(move.isDrop()).toBeTrue();
            expect(move.isSimple()).toBeFalse();
            expect(move.isJump()).toBeFalse();
        });
        it('should forbid creating a drop out of the board', () => {
            expect(ConspirateursMoveDrop.of(new Coord(-1, -1)).isFailure()).toBeTrue();
        });
    });
    describe('simple', () => {
        const move: ConspirateursMoveSimple = simpleMove(new Coord(7, 7), new Coord(7, 8));
        it('should redefine equality for simple moves', () => {
            const sameSimpleMove: ConspirateursMoveSimple = simpleMove(new Coord(7, 7), new Coord(7, 8));
            const otherSimpleMove: ConspirateursMoveSimple = simpleMove(new Coord(7, 8), new Coord(7, 7));
            const yetAnotherSimpleMove: ConspirateursMoveSimple = simpleMove(new Coord(7, 7), new Coord(6, 7));
            const notASimpleMove: ConspirateursMove = drop(new Coord(7, 7));
            expect(move.equals(move)).toBeTrue();
            expect(move.equals(sameSimpleMove)).toBeTrue();
            expect(move.equals(otherSimpleMove)).toBeFalse();
            expect(move.equals(yetAnotherSimpleMove)).toBeFalse();
            expect(move.equals(notASimpleMove)).toBeFalse();
        });
        it('should redefine toString for simple moves', () => {
            expect(move.toString()).toBe('ConspirateursMoveSimple((7, 7) -> (7, 8))');
        });
        it('should redefine type checks for simple moves', () => {
            expect(move.isDrop()).toBeFalse();
            expect(move.isSimple()).toBeTrue();
            expect(move.isJump()).toBeFalse();
        });
        it('should forbid creating a simple move out of the board', () => {
            expect(ConspirateursMoveSimple.of(new Coord(-1, 0), new Coord(0, 0)).isFailure()).toBeTrue();
            expect(ConspirateursMoveSimple.of(new Coord(0, 0), new Coord(-1, 0)).isFailure()).toBeTrue();
        });
        it('should forbid creating a move that has a distance of more than one', () => {
            const failure: MGPFallible<ConspirateursMoveSimple> =
                ConspirateursMoveSimple.of(new Coord(0, 0), new Coord(2, 0));
            expect(failure.isFailure()).toBeTrue();
            expect(failure.getReason()).toBe(ConspirateursFailure.SIMPLE_MOVE_SHOULD_BE_OF_ONE_STEP());
        });
    });
    describe('jump', () => {
        const move: ConspirateursMoveJump = jump([new Coord(7, 7), new Coord(7, 9), new Coord(7, 11)]);
        it('should redefine equality for jumps', () => {
            const sameJump: ConspirateursMoveJump = jump([new Coord(7, 7), new Coord(7, 9), new Coord(7, 11)]);
            const otherJump: ConspirateursMoveJump = jump([new Coord(7, 7), new Coord(7, 9)]);
            const yetAnotherJump: ConspirateursMoveJump = jump([new Coord(7, 8), new Coord(7, 10), new Coord(7, 12)]);
            const notAJump: ConspirateursMove = drop(new Coord(7, 7));

            expect(move.equals(move)).toBeTrue();
            expect(move.equals(sameJump)).toBeTrue();
            expect(move.equals(otherJump)).toBeFalse();
            expect(move.equals(yetAnotherJump)).toBeFalse();
            expect(move.equals(notAJump)).toBeFalse();
        });
        it('should redefine toString for jumps', () => {
            expect(move.toString()).toBe('ConspirateursMoveJump((7, 7) -> (7, 9) -> (7, 11))');
        });
        it('should redefine type checks for jumps', () => {
            expect(move.isDrop()).toBeFalse();
            expect(move.isSimple()).toBeFalse();
            expect(move.isJump()).toBeTrue();
        });
        it('should forbid creating a jump with less than two coordinates', () => {
            expect(ConspirateursMoveJump.of([new Coord(1, 1)]).isFailure()).toBeTrue();
        });
        it('should forbid creating a jump with more than two spaces between coordinates', () => {
            expect(ConspirateursMoveJump.of([new Coord(1, 1), new Coord(1, 5)]).isFailure()).toBeTrue();
        });
        it('should forbid creating a jump with an invalid direction', () => {
            expect(ConspirateursMoveJump.of([new Coord(1, 1), new Coord(3, 5)]).isFailure()).toBeTrue();
        });
        it('should forbid creating a jump out of the board', () => {
            expect(ConspirateursMoveJump.of([new Coord(1, 1), new Coord(-1, 1)]).isFailure()).toBeTrue();
        });
    });
    describe('encoder', () => {
        it('should correctly encode and decode all moves', () => {
            EncoderTestUtils.expectToBeCorrect(ConspirateursMoveEncoder,
                                               ConspirateursMoveDrop.of(new Coord(7, 7)).get());
            EncoderTestUtils.expectToBeCorrect(ConspirateursMoveEncoder,
                                               ConspirateursMoveSimple.of(new Coord(7, 7), new Coord(7, 8)).get());
            EncoderTestUtils.expectToBeCorrect(ConspirateursMoveEncoder,
                                               ConspirateursMoveJump.of([new Coord(7, 7), new Coord(7, 9)]).get());
        });
    });
});
