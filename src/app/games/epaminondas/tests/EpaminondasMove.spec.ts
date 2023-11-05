/* eslint-disable max-lines-per-function */
import { Direction } from 'src/app/jscaip/Direction';
import { EpaminondasConfig, EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasMove } from '../EpaminondasMove';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { EpaminondasMoveGenerator } from '../EpaminondasMoveGenerator';
import { MoveTestUtils } from 'src/app/jscaip/tests/Move.spec';

describe('EpaminondasMove: ', () => {

    it('should forbid creation of a move that moves too much', () => {
        function movingAPhalanxTooMuch(): void {
            new EpaminondasMove(0, 0, 2, 3, Direction.UP);
        }
        RulesUtils.expectToThrowAndLog(movingAPhalanxTooMuch, 'Cannot move a phalanx further than its size (got step size 3 for 2 pieces).');
    });
    it('should forbid creation of a move with with negative or null number of selected piece', () => {
        function selectingNegativeNumberOfPiece(): void {
            new EpaminondasMove(0, 0, -1, 0, Direction.UP);
        }
        RulesUtils.expectToThrowAndLog(selectingNegativeNumberOfPiece, 'Must select minimum one piece (got -1).');
    });
    it('should forbid creation of move of null step', () => {
        function movingOfZeroStep(): void {
            new EpaminondasMove(2, 2, 1, 0, Direction.UP);
        }
        RulesUtils.expectToThrowAndLog(movingOfZeroStep, 'Step size must be minimum one (got 0).');
    });
    it('should have a bijective encoder', () => {
        const rules: EpaminondasRules = EpaminondasRules.get();
        const defaultConfig: EpaminondasConfig = rules.getRulesConfigDescription().defaultConfig.config;
        const moveGenerator: EpaminondasMoveGenerator = new EpaminondasMoveGenerator();
        MoveTestUtils.testFirstTurnMovesBijectivity(rules, moveGenerator, EpaminondasMove.encoder, defaultConfig);
    });
    it('should override correctly equals and toString', () => {
        const move: EpaminondasMove = new EpaminondasMove(4, 3, 2, 1, Direction.UP);
        const neighbor: EpaminondasMove = new EpaminondasMove(0, 0, 2, 1, Direction.UP);
        const twin: EpaminondasMove = new EpaminondasMove(4, 3, 2, 1, Direction.UP);
        const firstCousin: EpaminondasMove = new EpaminondasMove(4, 3, 1, 1, Direction.UP);
        const secondCousin: EpaminondasMove = new EpaminondasMove(4, 3, 2, 2, Direction.UP);
        const thirdCousin: EpaminondasMove = new EpaminondasMove(4, 3, 2, 1, Direction.LEFT);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(neighbor)).toBeFalse();
        expect(move.equals(firstCousin)).toBeFalse();
        expect(move.equals(secondCousin)).toBeFalse();
        expect(move.equals(thirdCousin)).toBeFalse();
        expect(move.equals(twin)).toBeTrue();
        expect(move.toString()).toBe('EpaminondasMove((4, 3), m:2, s:1, UP)');
    });
});
