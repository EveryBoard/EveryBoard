/* eslint-disable max-lines-per-function */
import { MoveTestUtils } from 'src/app/jscaip/tests/Move.spec';
import { AwaleMove } from '../AwaleMove';
import { AwaleMoveGenerator } from '../AwaleMoveGenerator';
import { AwaleRules } from '../AwaleRules';

describe('AwaleMove', () => {

    it('should have a bijective encoder', () => {
        const rules: AwaleRules = AwaleRules.get();
        const moveGenerator: AwaleMoveGenerator = new AwaleMoveGenerator();
        // MoveTestUtils.testFirstTurnMovesBijectivity(rules, moveGenerator, AwaleMove.encoder);
    });

    it('should override equals correctly', () => {
        const move: AwaleMove = AwaleMove.of(0);
        const other: AwaleMove = AwaleMove.of(1);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(other)).toBeFalse();
    });

});
