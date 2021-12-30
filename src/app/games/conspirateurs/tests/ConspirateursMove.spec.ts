/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ConspirateursFailure } from '../ConspirateursFailure';
import { ConspirateursMoveDrop, ConspirateursMoveEncoder, ConspirateursMoveJump, ConspirateursMoveSimple } from '../ConspirateursMove';

describe('ConspirateursMove', () => {
    describe('drop', () => {
        const drop: ConspirateursMoveDrop = ConspirateursMoveDrop.of(new Coord(7, 7)).get();
        it('should redefine equality', () => {
            expect(drop.equals(drop)).toBeTrue();
            const otherDrop: ConspirateursMoveDrop = ConspirateursMoveDrop.of(new Coord(8, 8)).get();
            expect(drop.equals(otherDrop)).toBeFalse();
        });
        it('should redefine toString for drops', () => {
            expect(drop.toString()).toBe('ConspirateursMoveDrop((7, 7))');
        });
        it('should redefine type checks for drops', () => {
            expect(drop.isDrop()).toBeTrue();
            expect(drop.isSimple()).toBeFalse();
        });
        it('should forbid creating a drop out of the board', () => {
            expect(ConspirateursMoveDrop.of(new Coord(-1, -1)).isFailure()).toBeTrue();
        });
    });
    describe('simple', () => {
        const simpleMove: ConspirateursMoveSimple = ConspirateursMoveSimple.of(new Coord(7, 7), new Coord(7, 8)).get();
        it('should redefine equality for simple moves', () => {
            expect(simpleMove.equals(simpleMove)).toBeTrue();

            const sameSimpleMove: ConspirateursMoveSimple =
                ConspirateursMoveSimple.of(new Coord(7, 7), new Coord(7, 8)).get();
            expect(simpleMove.equals(sameSimpleMove)).toBeTrue();

            const otherSimpleMove: ConspirateursMoveSimple =
                ConspirateursMoveSimple.of(new Coord(7, 8), new Coord(7, 7)).get();
            expect(simpleMove.equals(otherSimpleMove)).toBeFalse();

            const yetAnotherSimpleMove: ConspirateursMoveSimple =
                ConspirateursMoveSimple.of(new Coord(7, 7), new Coord(6, 7)).get();
            expect(simpleMove.equals(yetAnotherSimpleMove)).toBeFalse();
        });
        it('should redefine toString for simple moves', () => {
            expect(simpleMove.toString()).toBe('ConspirateursMoveSimple((7, 7) -> (7, 8))');
        });
        it('should redefine type checks for simple moves', () => {
            expect(simpleMove.isDrop()).toBeFalse();
            expect(simpleMove.isSimple()).toBeTrue();
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
        const jump: ConspirateursMoveJump =
            ConspirateursMoveJump.of([new Coord(7, 7), new Coord(7, 9), new Coord(7, 11)]).get();
        it('should redefine equality for jumps', () => {
            expect(jump.equals(jump)).toBeTrue();

            const sameJump: ConspirateursMoveJump =
                ConspirateursMoveJump.of([new Coord(7, 7), new Coord(7, 9), new Coord(7, 11)]).get();
            expect(jump.equals(sameJump)).toBeTrue();

            const otherJump: ConspirateursMoveJump =
                ConspirateursMoveJump.of([new Coord(7, 7), new Coord(7, 9)]).get();
            expect(jump.equals(otherJump)).toBeFalse();

            const yetAnotherJump: ConspirateursMoveJump =
                ConspirateursMoveJump.of([new Coord(7, 8), new Coord(7, 10), new Coord(7, 12)]).get();
            expect(jump.equals(yetAnotherJump)).toBeFalse();
        });
        it('should redefine toString for jumps', () => {
            expect(jump.toString()).toBe('ConspirateursMoveJump((7, 7) -> (7, 9) -> (7, 11))');
        });
        it('should redefine type checks for jumps', () => {
            expect(jump.isDrop()).toBeFalse();
            expect(jump.isSimple()).toBeFalse();
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
