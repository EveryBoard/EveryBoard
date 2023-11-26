/* eslint-disable max-lines-per-function */
import { AwaleRules } from '../awale/AwaleRules';
import { AwaleMove } from '../awale/AwaleMove';
import { MoveTestUtils } from 'src/app/jscaip/tests/Move.spec';
import { AwaleMoveGenerator } from '../awale/AwaleMoveGenerator';

describe('AwaleMove', () => {

    it('should have a bijective encoder', () => {
        const rules: AwaleRules = AwaleRules.get();
        const moveGenerator: AwaleMoveGenerator = new AwaleMoveGenerator();
        MoveTestUtils.testFirstTurnMovesBijectivity(rules, moveGenerator, AwaleMove.encoder);
    });
    it('should override equals correctly', () => {
        const move: AwaleMove = AwaleMove.ZERO;
        const other: AwaleMove = AwaleMove.ONE;
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(other)).toBeFalse();
    });
});
