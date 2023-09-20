import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { DiaballikMove, DiaballikPass, DiaballikTranslation } from '../DiaballikMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { DiaballikFailure } from '../DiaballikRules';
import { MGPFallible } from 'src/app/utils/MGPFallible';

describe('DiaballikMove', () => {
    it('should reject out of board moves', () => {
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        const invalidCoord: Coord = new Coord(-1, 0);
        const validCoord: Coord = new Coord(0, 0);
        expect(() => DiaballikTranslation.from(invalidCoord, validCoord))
            .toThrowError('Assertion failure: DiaballikMove not on board');
        expect(() => DiaballikTranslation.from(validCoord, invalidCoord))
            .toThrowError('Assertion failure: DiaballikMove not on board');
        expect(() => DiaballikPass.from(invalidCoord, validCoord))
            .toThrowError('Assertion failure: DiaballikMove not on board');
        expect(() => DiaballikPass.from(validCoord, invalidCoord))
            .toThrowError('Assertion failure: DiaballikMove not on board');
    });
    it('should reject move with more than one pass', () => {
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        const pass: DiaballikPass = DiaballikPass.from(new Coord(0, 0), new Coord(1, 0)).get();
        const translation: DiaballikTranslation = DiaballikTranslation.from(new Coord(0, 0), new Coord(1, 0)).get();
        expect(() => new DiaballikMove(pass, MGPOptional.of(pass), MGPOptional.empty()))
            .toThrowError('Assertion failure: DiaballikMove should have at most one pass');
        expect(() => new DiaballikMove(pass, MGPOptional.of(translation), MGPOptional.of(pass)))
            .toThrowError('Assertion failure: DiaballikMove should have at most one pass');
    });
    it('should reject move that translate by more than one orthogonal space', () => {
        const invalidTranslation: MGPFallible<DiaballikTranslation> =
            DiaballikTranslation.from(new Coord(0, 0), new Coord(3, 0));
        expect(invalidTranslation.isFailure()).toBeTrue();
        expect(invalidTranslation.getReason()).toBe(DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
    });
    it('should reject move that translate diagonally', () => {
        const invalidTranslation: MGPFallible<DiaballikTranslation> =
            DiaballikTranslation.from(new Coord(0, 0), new Coord(1, 1));
        expect(invalidTranslation.isFailure()).toBeTrue();
        expect(invalidTranslation.getReason()).toBe(DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
    });
    it('should reject move that do not pass on a straight line', () => {
        const invalidPass: MGPFallible<DiaballikPass> =
            DiaballikPass.from(new Coord(0, 0), new Coord(1, 2));
        expect(invalidPass.isFailure()).toBeTrue();
        expect(invalidPass.getReason()).toBe(DiaballikFailure.PASS_MUST_BE_IN_STRAIGHT_LINE());
    });
    describe('toString', () => {
        it('should be defined', () => {
            const translation: DiaballikTranslation = DiaballikTranslation.from(new Coord(0, 0), new Coord(1, 0)).get();
            const move: DiaballikMove = new DiaballikMove(translation, MGPOptional.empty(), MGPOptional.empty());
            expect(move.toString()).toBe('DiaballikMove((0, 0) -> (1, 0), MGPOptional.empty(), MGPOptional.empty())');
        });
    });
    describe('equals', () => {
        it('should return true for the same move', () => {
            const translation: DiaballikTranslation = DiaballikTranslation.from(new Coord(0, 0), new Coord(1, 0)).get();
            const move: DiaballikMove = new DiaballikMove(translation, MGPOptional.empty(), MGPOptional.empty());
            expect(move.equals(move)).toBeTrue()
        });
        it('should return false for another move', () => {
            const firstTranslation: DiaballikTranslation = DiaballikTranslation.from(new Coord(0, 0), new Coord(1, 0)).get();
            const secondTranslation: DiaballikTranslation = DiaballikTranslation.from(new Coord(0, 1), new Coord(1, 1)).get();
            // A pass that happens to have the same coords as one of the translations (on purpose)
            const pass: DiaballikPass = DiaballikPass.from(new Coord(0, 0), new Coord(1, 0)).get();
            const fullMove: DiaballikMove = new DiaballikMove(firstTranslation,
                                                              MGPOptional.of(secondTranslation),
                                                              MGPOptional.of(pass));
            const otherFullMove: DiaballikMove = new DiaballikMove(secondTranslation,
                                                                   MGPOptional.of(firstTranslation),
                                                                   MGPOptional.of(pass));
            const yetAnotherFullMove: DiaballikMove = new DiaballikMove(firstTranslation,
                                                                   MGPOptional.of(pass),
                                                                   MGPOptional.of(secondTranslation));
            const moveWithoutPass: DiaballikMove = new DiaballikMove(firstTranslation,
                                                                     MGPOptional.of(secondTranslation),
                                                                     MGPOptional.empty());
            const moveWithoutSecondTranslation: DiaballikMove = new DiaballikMove(firstTranslation,
                                                                                  MGPOptional.empty(),
                                                                                  MGPOptional.of(pass));
            expect(fullMove.equals(fullMove)).toBeTrue();
            expect(fullMove.equals(otherFullMove)).toBeFalse();
            expect(fullMove.equals(yetAnotherFullMove)).toBeFalse();
            expect(fullMove.equals(moveWithoutPass)).toBeFalse();
            expect(fullMove.equals(moveWithoutSecondTranslation)).toBeFalse();
        });
    });
    describe('encoder', () => {
        it('should be bijective', () => {
            const firstTranslation: DiaballikTranslation = DiaballikTranslation.from(new Coord(0, 0), new Coord(1, 0)).get();
            const secondTranslation: DiaballikTranslation = DiaballikTranslation.from(new Coord(0, 1), new Coord(1, 1)).get();
            // A pass that happens to have the same coords as one of the translations (on purpose)
            const pass: DiaballikPass = DiaballikPass.from(new Coord(0, 0), new Coord(1, 0)).get();
            const fullMove: DiaballikMove = new DiaballikMove(firstTranslation,
                                                              MGPOptional.of(secondTranslation),
                                                              MGPOptional.of(pass));
            const otherFullMove: DiaballikMove = new DiaballikMove(secondTranslation,
                                                                   MGPOptional.of(firstTranslation),
                                                                   MGPOptional.of(pass));
            const yetAnotherFullMove: DiaballikMove = new DiaballikMove(firstTranslation,
                                                                   MGPOptional.of(pass),
                                                                   MGPOptional.of(secondTranslation));
            const moveWithoutPass: DiaballikMove = new DiaballikMove(firstTranslation,
                                                                     MGPOptional.of(secondTranslation),
                                                                     MGPOptional.empty());
            const moveWithoutSecondTranslation: DiaballikMove = new DiaballikMove(firstTranslation,
                                                                                  MGPOptional.empty(),
                                                                                  MGPOptional.of(pass));
            const moves: DiaballikMove[] = [
                // TODO: from move generator
                fullMove,
                otherFullMove,
                yetAnotherFullMove,
                moveWithoutPass,
                moveWithoutSecondTranslation,
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(DiaballikMove.encoder, move);
            }
        });
    });
});
