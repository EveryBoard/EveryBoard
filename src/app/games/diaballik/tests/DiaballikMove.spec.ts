import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { DiaballikMove } from '../DiaballikMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { DiaballikFailure } from '../DiaballikRules';
import { MGPFallible } from 'src/app/utils/MGPFallible';

describe('DiaballikMove', () => {
    it('should reject move that does nothing', () => {
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        expect(() => DiaballikMove.from(MGPOptional.empty(), MGPOptional.empty(), MGPOptional.empty()))
            .toThrowError('Assertion failure: DiaballikMove should at least do something');
    });
    it('should reject move that goes out of the board', () => {
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        const invalidCoord: Coord = new Coord(-1, 0);
        const validCoord: Coord = new Coord(0, 0);
        const fromInvalid: MoveCoordToCoord = new MoveCoordToCoord(invalidCoord, validCoord);
        const toInvalid: MoveCoordToCoord = new MoveCoordToCoord(validCoord, invalidCoord);
        expect(() => DiaballikMove.from(MGPOptional.of(fromInvalid),
                                        MGPOptional.empty(),
                                        MGPOptional.empty()))
            .toThrowError('Assertion failure: DiaballikMove not on board');
        expect(() => DiaballikMove.from(MGPOptional.empty(),
                                        MGPOptional.of(fromInvalid),
                                        MGPOptional.empty()))
            .toThrowError('Assertion failure: DiaballikMove not on board');
        expect(() => DiaballikMove.from(MGPOptional.empty(),
                                        MGPOptional.empty(),
                                        MGPOptional.of(fromInvalid)))
            .toThrowError('Assertion failure: DiaballikMove not on board');
        expect(() => DiaballikMove.from(MGPOptional.of(toInvalid),
                                        MGPOptional.empty(),
                                        MGPOptional.empty()))
            .toThrowError('Assertion failure: DiaballikMove not on board');
    });
    it('should reject move that translate by more than one orthogonal space', () => {
        const invalidTranslation: MoveCoordToCoord = new MoveCoordToCoord(new Coord(0, 0), new Coord(3, 0));
        const firstMove: MGPFallible<DiaballikMove> = DiaballikMove.from(MGPOptional.of(invalidTranslation),
                                                                         MGPOptional.empty(),
                                                                         MGPOptional.empty());
        const secondMove: MGPFallible<DiaballikMove> = DiaballikMove.from(MGPOptional.empty(),
                                                                          MGPOptional.of(invalidTranslation),
                                                                          MGPOptional.empty());
        expect(firstMove.getReason()).toBe(DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
        expect(secondMove.getReason()).toBe(DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
    });
    it('should reject move that translate diagonally', () => {
        const invalidTranslation: MoveCoordToCoord = new MoveCoordToCoord(new Coord(0, 0), new Coord(1, 1));
        const move: MGPFallible<DiaballikMove> = DiaballikMove.from(MGPOptional.of(invalidTranslation),
                                                                    MGPOptional.empty(),
                                                                    MGPOptional.empty());
        expect(move.getReason()).toBe(DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
    });
    it('should reject move that do not pass on a straight line', () => {
        const invalidPass: MoveCoordToCoord = new MoveCoordToCoord(new Coord(0, 0), new Coord(1, 2));
        const move: MGPFallible<DiaballikMove> = DiaballikMove.from(MGPOptional.empty(),
                                                                    MGPOptional.empty(),
                                                                    MGPOptional.of(invalidPass));
        expect(move.getReason()).toBe(DiaballikFailure.PASS_MUST_BE_IN_STRAIGHT_LINE());
    });
    describe('toString', () => {
        it('should be defined', () => {
            const translation: MoveCoordToCoord = new MoveCoordToCoord(new Coord(0, 0), new Coord(1, 0));
            const move: DiaballikMove = DiaballikMove.from(MGPOptional.of(translation),
                                                           MGPOptional.empty(),
                                                           MGPOptional.empty()).get();
            expect(move.toString()).toBe('DiaballikMove(MGPOptional.of((0, 0) -> (1, 0)), MGPOptional.empty(), MGPOptional.empty())');
        });
    });
    describe('equals', () => {
        it('should return true for the same move', () => {
            const translation: MoveCoordToCoord = new MoveCoordToCoord(new Coord(0, 0), new Coord(1, 0));
            const move: DiaballikMove = DiaballikMove.from(MGPOptional.of(translation),
                                                           MGPOptional.empty(),
                                                           MGPOptional.empty()).get();
            expect(move.equals(move)).toBeTrue()
        });
        it('should return false for another move', () => {
            const firstTranslation: MoveCoordToCoord = new MoveCoordToCoord(new Coord(0, 0), new Coord(1, 0));
            const secondTranslation: MoveCoordToCoord = new MoveCoordToCoord(new Coord(0, 1), new Coord(1, 1));
            const pass: MoveCoordToCoord = new MoveCoordToCoord(new Coord(2, 2), new Coord(1, 1));
            const fullMove: DiaballikMove = DiaballikMove.from(MGPOptional.of(firstTranslation),
                                                               MGPOptional.of(secondTranslation),
                                                               MGPOptional.of(pass)).get();
            const otherFullMove: DiaballikMove = DiaballikMove.from(MGPOptional.of(secondTranslation),
                                                                    MGPOptional.of(firstTranslation),
                                                                    MGPOptional.of(pass)).get();
            const moveWithoutPass: DiaballikMove = DiaballikMove.from(MGPOptional.of(firstTranslation),
                                                                      MGPOptional.of(secondTranslation),
                                                                      MGPOptional.empty()).get();
            const moveWithoutSecondTranslation: DiaballikMove = DiaballikMove.from(MGPOptional.of(firstTranslation),
                                                                                   MGPOptional.empty(),
                                                                                   MGPOptional.of(pass)).get();
            expect(fullMove.equals(fullMove)).toBeTrue();
            expect(fullMove.equals(otherFullMove)).toBeFalse();
            expect(fullMove.equals(moveWithoutPass)).toBeFalse();
            expect(fullMove.equals(moveWithoutSecondTranslation)).toBeFalse();
        });
    });
    describe('encoder', () => {
        it('should be bijective', () => {
            const firstTranslation: MoveCoordToCoord = new MoveCoordToCoord(new Coord(0, 0), new Coord(1, 0));
            const secondTranslation: MoveCoordToCoord = new MoveCoordToCoord(new Coord(0, 1), new Coord(1, 1));
            const pass: MoveCoordToCoord = new MoveCoordToCoord(new Coord(2, 2), new Coord(1, 1));
            const fullMove: DiaballikMove = DiaballikMove.from(MGPOptional.of(firstTranslation),
                                                               MGPOptional.of(secondTranslation),
                                                               MGPOptional.of(pass)).get();
            const otherFullMove: DiaballikMove = DiaballikMove.from(MGPOptional.of(secondTranslation),
                                                                    MGPOptional.of(firstTranslation),
                                                                    MGPOptional.of(pass)).get();
            const moveWithoutPass: DiaballikMove = DiaballikMove.from(MGPOptional.of(firstTranslation),
                                                                      MGPOptional.of(secondTranslation),
                                                                      MGPOptional.empty()).get();
            const moveWithoutSecondTranslation: DiaballikMove = DiaballikMove.from(MGPOptional.of(firstTranslation),
                                                                                   MGPOptional.empty(),
                                                                                   MGPOptional.of(pass)).get();
            const moves: DiaballikMove[] = [
                // TODO: from move generator
                fullMove,
                otherFullMove,
                moveWithoutPass,
                moveWithoutSecondTranslation,
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(DiaballikMove.encoder, move);
            }
        });
    });
});
