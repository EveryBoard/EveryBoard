import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { DiaballikMove, DiaballikPass, DiaballikTranslation } from '../DiaballikMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { DiaballikFailure } from '../DiaballikFailure';

fdescribe('DiaballikMove', () => {
    it('should reject out of board moves', () => {
        const invalidCoord: Coord = new Coord(-1, 0);
        const validCoord: Coord = new Coord(0, 0);
        RulesUtils.expectToThrowAndLog(() => DiaballikTranslation.from(invalidCoord, validCoord),
                                       'DiaballikMove not on board');
        RulesUtils.expectToThrowAndLog(() => DiaballikTranslation.from(validCoord, invalidCoord),
                                       'DiaballikMove not on board');
        RulesUtils.expectToThrowAndLog(() => DiaballikPass.from(invalidCoord, validCoord),
                                       'DiaballikMove not on board');
        RulesUtils.expectToThrowAndLog(() => DiaballikPass.from(validCoord, invalidCoord),
                                       'DiaballikMove not on board');
    });
    it('should reject move with more than one pass', () => {
        const pass: DiaballikPass = DiaballikPass.from(new Coord(0, 0), new Coord(1, 0)).get();
        const translation: DiaballikTranslation = DiaballikTranslation.from(new Coord(0, 0), new Coord(1, 0)).get();
        RulesUtils.expectToThrowAndLog(() => new DiaballikMove(pass, MGPOptional.of(pass), MGPOptional.empty()),
                                       'DiaballikMove should have at most one pass');
        RulesUtils.expectToThrowAndLog(() => new DiaballikMove(pass, MGPOptional.of(translation), MGPOptional.of(pass)),
                                       'DiaballikMove should have at most one pass');
    });
    it('should reject move with three translations', () => {
        const first: DiaballikTranslation = DiaballikTranslation.from(new Coord(0, 0), new Coord(0, 1)).get();
        const second: DiaballikTranslation = DiaballikTranslation.from(new Coord(0, 1), new Coord(1, 1)).get();
        const third: DiaballikTranslation = DiaballikTranslation.from(new Coord(1, 1), new Coord(2, 1)).get();
        RulesUtils.expectToThrowAndLog(() => new DiaballikMove(first, MGPOptional.of(second), MGPOptional.of(third)),
                                       'DiaballikMove should have at most two translations');


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
    it('should compute the list of moves with getSubMoves', () => {
        const first: DiaballikTranslation = DiaballikTranslation.from(new Coord(0, 0), new Coord(1, 0)).get();
        const second: DiaballikTranslation = DiaballikTranslation.from(new Coord(0, 1), new Coord(1, 1)).get();
        const third: DiaballikPass = DiaballikPass.from(new Coord(0, 0), new Coord(1, 0)).get();
        const moveWithOne: DiaballikMove = new DiaballikMove(first, MGPOptional.empty(), MGPOptional.empty());
        const moveWithTwo: DiaballikMove = new DiaballikMove(second, MGPOptional.of(second), MGPOptional.empty());
        const moveWithThree: DiaballikMove = new DiaballikMove(first, MGPOptional.of(second), MGPOptional.of(third));
        expect(moveWithOne.getSubMoves().length).toBe(1);
        expect(moveWithTwo.getSubMoves().length).toBe(2);
        expect(moveWithThree.getSubMoves().length).toBe(3);
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
            expect(fullMove.equals(fullMove)).toBeTrue();
            expect(fullMove.equals(otherFullMove)).toBeFalse();
            expect(fullMove.equals(yetAnotherFullMove)).toBeFalse();
            expect(fullMove.equals(moveWithoutPass)).toBeFalse();
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
            const moves: DiaballikMove[] = [
                fullMove,
                otherFullMove,
                yetAnotherFullMove,
                moveWithoutPass,
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(DiaballikMove.encoder, move);
            }
        });
    });
});
