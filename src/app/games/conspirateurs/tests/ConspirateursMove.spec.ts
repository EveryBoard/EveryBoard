/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ConspirateursFailure } from '../ConspirateursFailure';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveEncoder, ConspirateursMoveJump, ConspirateursMoveSimple } from '../ConspirateursMove';

describe('ConspirateursMove', () => {
    describe('drop', () => {
        const drop: ConspirateursMoveDrop = ConspirateursMoveDrop.of(new Coord(7, 7)).get();
        it('should redefine equality', () => {
            const otherDrop: ConspirateursMoveDrop = ConspirateursMoveDrop.of(new Coord(8, 8)).get();
            const notADrop: ConspirateursMove = ConspirateursMoveSimple.of(new Coord(7, 7), new Coord(7, 6)).get();
            expect(drop.equals(drop)).toBeTrue();
            expect(drop.equals(otherDrop)).toBeFalse();
            expect(drop.equals(notADrop)).toBeFalse();
        });
        it('should redefine toString for drops', () => {
            expect(drop.toString()).toBe('ConspirateursMoveDrop((7, 7))');
        });
        it('should redefine type checks for drops', () => {
            expect(drop.isDrop()).toBeTrue();
            expect(drop.isSimple()).toBeFalse();
            expect(drop.isJump()).toBeFalse();
        });
        it('should forbid creating a drop out of the board', () => {
            expect(ConspirateursMoveDrop.of(new Coord(-1, -1)).isFailure()).toBeTrue();
        });
    });
    describe('simple', () => {
        const simpleMove: ConspirateursMoveSimple = ConspirateursMoveSimple.of(new Coord(7, 7), new Coord(7, 8)).get();
        it('should redefine equality for simple moves', () => {
            const sameSimpleMove: ConspirateursMoveSimple =
                ConspirateursMoveSimple.of(new Coord(7, 7), new Coord(7, 8)).get();
            const otherSimpleMove: ConspirateursMoveSimple =
                ConspirateursMoveSimple.of(new Coord(7, 8), new Coord(7, 7)).get();
            const yetAnotherSimpleMove: ConspirateursMoveSimple =
                ConspirateursMoveSimple.of(new Coord(7, 7), new Coord(6, 7)).get();
            const notASimpleMove: ConspirateursMove = ConspirateursMoveDrop.of(new Coord(7, 7)).get();
            expect(simpleMove.equals(simpleMove)).toBeTrue();
            expect(simpleMove.equals(sameSimpleMove)).toBeTrue();
            expect(simpleMove.equals(otherSimpleMove)).toBeFalse();
            expect(simpleMove.equals(yetAnotherSimpleMove)).toBeFalse();
            expect(simpleMove.equals(notASimpleMove)).toBeFalse();
        });
        it('should redefine toString for simple moves', () => {
            expect(simpleMove.toString()).toBe('ConspirateursMoveSimple((7, 7) -> (7, 8))');
        });
        it('should redefine type checks for simple moves', () => {
            expect(simpleMove.isDrop()).toBeFalse();
            expect(simpleMove.isSimple()).toBeTrue();
            expect(simpleMove.isJump()).toBeFalse();
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
        const jumpCoords: Coord[] = [new Coord(7, 7), new Coord(7, 9), new Coord(7, 11)];
        const jump: ConspirateursMoveJump = ConspirateursMoveJump.of(jumpCoords).get();
        it('should redefine equality for jumps', () => {
            const sameJump: ConspirateursMoveJump = ConspirateursMoveJump.of(jumpCoords).get();
            const otherCoords: Coord[] = [new Coord(7, 7), new Coord(7, 9)];
            const otherJump: ConspirateursMoveJump = ConspirateursMoveJump.of(otherCoords).get();
            const yetAnotherJumpCoords: Coord[] = [new Coord(7, 8), new Coord(7, 10), new Coord(7, 12)];
            const yetAnotherJump: ConspirateursMoveJump = ConspirateursMoveJump.of(yetAnotherJumpCoords).get();
            const notAJump: ConspirateursMove = ConspirateursMoveDrop.of(new Coord(7, 7)).get();

            expect(jump.equals(jump)).toBeTrue();
            expect(jump.equals(sameJump)).toBeTrue();
            expect(jump.equals(otherJump)).toBeFalse();
            expect(jump.equals(yetAnotherJump)).toBeFalse();
            expect(jump.equals(notAJump)).toBeFalse();
        });
        it('should redefine toString for jumps', () => {
            expect(jump.toString()).toBe('ConspirateursMoveJump((7, 7) -> (7, 9) -> (7, 11))');
        });
        it('should redefine type checks for jumps', () => {
            expect(jump.isDrop()).toBeFalse();
            expect(jump.isSimple()).toBeFalse();
            expect(jump.isJump()).toBeTrue();
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
