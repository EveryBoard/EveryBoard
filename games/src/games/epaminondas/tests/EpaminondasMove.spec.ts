/* eslint-disable max-lines-per-function */
import { TestUtils } from '@everyboard/lib/testing';

import { EightDirection } from '../../../jscaip/direction/EightDirection';
import { MoveTestUtils } from '../../../jscaip/tests/MoveTestUtils.spec';
import { EpaminondasFailure } from '../EpaminondasFailure';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasMoveGenerator } from '../EpaminondasMoveGenerator';
import { EpaminondasRules } from '../EpaminondasRules';

describe('EpaminondasMove: ', () => {

    it('should forbid creation of a move that moves too much', () => {
        function movingAPhalanxTooMuch(): void {
            new EpaminondasMove(0, 0, 2, 3, EightDirection.UP);
        }
        TestUtils.expectToThrowAndLog(
            movingAPhalanxTooMuch,
            EpaminondasFailure.PHALANX_CANNOT_JUMP_FURTHER_THAN_ITS_SIZE(3, 2),
        );
    });

    it('should forbid creation of a move with with negative or null number of selected piece', () => {
        function selectingNegativeNumberOfPiece(): void {
            new EpaminondasMove(0, 0, -1, 0, EightDirection.UP);
        }
        TestUtils.expectToThrowAndLog(selectingNegativeNumberOfPiece, 'Must select minimum one piece (got -1).');
    });

    it('should forbid creation of move of null step', () => {
        function movingOfZeroStep(): void {
            new EpaminondasMove(2, 2, 1, 0, EightDirection.UP);
        }
        TestUtils.expectToThrowAndLog(movingOfZeroStep, 'Step size must be minimum one (got 0).');
    });

    it('should have a bijective encoder', () => {
        const rules: EpaminondasRules = EpaminondasRules.get();
        const moveGenerator: EpaminondasMoveGenerator = new EpaminondasMoveGenerator();
        MoveTestUtils.testFirstTurnMovesBijectivity(rules, moveGenerator, EpaminondasMove.encoder);
    });

    it('should override correctly equals and toString', () => {
        const move: EpaminondasMove = new EpaminondasMove(4, 3, 2, 1, EightDirection.UP);
        const neighbor: EpaminondasMove = new EpaminondasMove(0, 0, 2, 1, EightDirection.UP);
        const twin: EpaminondasMove = new EpaminondasMove(4, 3, 2, 1, EightDirection.UP);
        const firstCousin: EpaminondasMove = new EpaminondasMove(4, 3, 1, 1, EightDirection.UP);
        const secondCousin: EpaminondasMove = new EpaminondasMove(4, 3, 2, 2, EightDirection.UP);
        const thirdCousin: EpaminondasMove = new EpaminondasMove(4, 3, 2, 1, EightDirection.LEFT);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(neighbor)).toBeFalse();
        expect(move.equals(firstCousin)).toBeFalse();
        expect(move.equals(secondCousin)).toBeFalse();
        expect(move.equals(thirdCousin)).toBeFalse();
        expect(move.equals(twin)).toBeTrue();
        expect(move.toString()).toBe('EpaminondasMove((4, 3), m:2, s:1, UP)');
    });

});
