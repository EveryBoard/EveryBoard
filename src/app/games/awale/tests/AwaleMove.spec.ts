/* eslint-disable max-lines-per-function */
import { AwaleRules } from '../AwaleRules';
import { AwaleMinimax } from '../AwaleMinimax';
import { AwaleMove } from '../AwaleMove';
import { AwaleState } from '../AwaleState';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';

describe('AwaleMove', () => {

    it('should have a bijective encoder', () => {
        const rules: AwaleRules = new AwaleRules(AwaleState);
        const minimax: AwaleMinimax = new AwaleMinimax(rules, 'AwaleMinimax');
        const firstTurnMoves: AwaleMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            EncoderTestUtils.expectToBeBijective(AwaleMove.encoder, move);
        }
    });
    it('should override equals correctly', () => {
        const move: AwaleMove = AwaleMove.ZERO;
        const other: AwaleMove = AwaleMove.ONE;
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(other)).toBeFalse();
    });
});
