/* eslint-disable max-lines-per-function */
import { AwaleRules } from '../AwaleRules';
import { AwaleMinimax } from '../AwaleMinimax';
import { AwaleMove } from '../AwaleMove';
import { AwaleState } from '../AwaleState';
import { NumberEncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';

fdescribe('AwaleMove', () => {

    it('AwaleMove.encoder should be correct', () => {
        const rules: AwaleRules = new AwaleRules(AwaleState);
        const minimax: AwaleMinimax = new AwaleMinimax(rules, 'AwaleMinimax');
        const firstTurnMoves: AwaleMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            NumberEncoderTestUtils.expectToBeCorrect(AwaleMove.encoder, move);
        }
    });
    it('Should override equals correctly', () => {
        const move: AwaleMove = AwaleMove.ZERO;
        const other: AwaleMove = AwaleMove.ONE;
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(other)).toBeFalse();
    });
});
