/* eslint-disable max-lines-per-function */

import { Coord } from '@everyboard/games';
import { MoveTestUtils } from '@everyboard/games';
import { EncoderTestUtils } from '@everyboard/lib/testing';

import { QuebecCastlesDrop, QuebecCastlesMove, QuebecCastlesTranslation } from '../QuebecCastlesMove';
import { QuebecCastlesMoveGenerator } from '../QuebecCastlesMoveGenerator';
import { QuebecCastlesRules } from '../QuebecCastlesRules';

describe('QuebecCastlesMove', () => {

    const rule: QuebecCastlesRules = QuebecCastlesRules.get();
    const moveGenerator: QuebecCastlesMoveGenerator = new QuebecCastlesMoveGenerator();

    it('should have a bijective encoder', () => {
        const moves: QuebecCastlesMove[] = [
            QuebecCastlesTranslation.of(new Coord(0, 0), new Coord(1, 1)),
            QuebecCastlesDrop.of([new Coord(0, 0), new Coord(1, 1), new Coord(2, 2)]),
        ];
        for (const move of moves) {
            EncoderTestUtils.expectToBeBijective(QuebecCastlesMove.encoder, move);
        }
        MoveTestUtils.testFirstTurnMovesBijectivity(rule, moveGenerator, QuebecCastlesMove.encoder);
    });

    it('should stringify nicely', () => {
        const moves: QuebecCastlesMove[] = [
            QuebecCastlesTranslation.of(new Coord(0, 0), new Coord(1, 1)),
            QuebecCastlesDrop.of([new Coord(0, 0), new Coord(1, 1), new Coord(2, 2)]),
        ];
        expect(moves[0].toString()).toBe('QuebecCastlesTranslation((0, 0) -> (1, 1))');
        expect(moves[1].toString()).toBe('QuebecCastlesDrop([(0, 0), (1, 1), (2, 2)])');
    });

    describe('equals', () => {

        it('should return true for identical drop', () => {
            // Given some drop
            const drop: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(0, 0)]);

            // When comparing it to another identical drop
            const identicDrop: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(0, 0)]);

            // Then it should be equal
            expect(drop.equals(identicDrop)).toBeTrue();
        });

        it('should return true for identical translation', () => {
            // Given some translation
            const translation: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(0, 0), new Coord(1, 1));

            // When comparing it to another identical translation
            const identicTranslation: QuebecCastlesMove =
                QuebecCastlesMove.translation(new Coord(0, 0), new Coord(1, 1));

            // Then it should be equal
            expect(translation.equals(identicTranslation)).toBeTrue();
        });

        it('should return false for drop vs translation', () => {
            // Given some drop
            const drop: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(0, 0), new Coord(1, 1)]);

            // When comparing it to a translation
            const translation: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(0, 0), new Coord(1, 1));

            // Then it should be equal
            expect(drop.equals(translation)).toBeFalse();
            expect(translation.equals(drop)).toBeFalse();
        });

        it('should return false vs different drops', () => {
            // Given some drop
            const drop: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(0, 0)]);

            // When comparing it to another different drop
            const differentDrop: QuebecCastlesMove = QuebecCastlesMove.drop([new Coord(1, 1)]);

            // Then it should be equal
            expect(drop.equals(differentDrop)).toBeFalse();
        });

        it('should return false vs different translations', () => {
            // Given some translation
            const translation: QuebecCastlesMove = QuebecCastlesMove.translation(new Coord(0, 0), new Coord(1, 1));

            // When comparing it to another different translation
            const otherTranslation: QuebecCastlesMove =
                QuebecCastlesMove.translation(new Coord(1, 1), new Coord(0, 0));

            // Then it should be equal
            expect(translation.equals(otherTranslation)).toBeFalse();
        });

    });

});
