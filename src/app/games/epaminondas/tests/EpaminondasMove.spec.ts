/* eslint-disable max-lines-per-function */
import { Direction } from 'src/app/jscaip/Direction';
import { EpaminondasNode, EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasMinimax } from '../EpaminondasMinimax';
import { EpaminondasMove } from '../EpaminondasMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';

describe('EpaminondasMove: ', () => {

    it('should forbid out of range coords', () => {
        function createLeftOfBoardCoord(): void {
            new EpaminondasMove(-1, 0, 1, 1, Direction.DOWN_LEFT);
        }
        RulesUtils.expectToThrowAndLog(createLeftOfBoardCoord, 'Illegal coord outside of board (-1, 0).');
    });
    it('should forbid creation of a move that moves too much', () => {
        function movingAPhalangeTooMuch(): void {
            new EpaminondasMove(0, 0, 2, 3, Direction.UP);
        }
        RulesUtils.expectToThrowAndLog(movingAPhalangeTooMuch, 'Cannot move a phalanx further than its size (got step size 3 for 2 pieces).');
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
        const minimax: EpaminondasMinimax = new EpaminondasMinimax(rules, 'EpaminondasMinimax');
        const node: EpaminondasNode = rules.getInitialNode();
        const moves: EpaminondasMove[] = minimax.getListMoves(node);
        for (const move of [moves[0]]) {
            EncoderTestUtils.expectToBeBijective(EpaminondasMove.encoder, move);
        }
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
