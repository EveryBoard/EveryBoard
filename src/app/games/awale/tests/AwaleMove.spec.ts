/* eslint-disable max-lines-per-function */
import { AwaleNode, AwaleRules, mancalaConfig } from '../AwaleRules';
import { AwaleMinimax } from '../AwaleMinimax';
import { AwaleMove } from '../AwaleMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';

describe('AwaleMove', () => {

    it('should have a bijective encoder', () => {
        const rules: AwaleRules = AwaleRules.get();
        const minimax: AwaleMinimax = new AwaleMinimax(rules, 'AwaleMinimax');
        const node: AwaleNode = rules.getInitialNode(mancalaConfig);
        const firstTurnMoves: AwaleMove[] = minimax.getListMoves(node);
        for (const move of firstTurnMoves) {
            EncoderTestUtils.expectToBeBijective(AwaleMove.encoder, move);
        }
    });
    it('should override equals correctly', () => {
        const move: AwaleMove = AwaleMove.of(0);
        const other: AwaleMove = AwaleMove.of(1);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(other)).toBeFalse();
    });
});
