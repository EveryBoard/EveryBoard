/* eslint-disable max-lines-per-function */
import { AwaleNode, AwaleRules } from '../awale/AwaleRules';
import { AwaleMinimax } from '../awale/AwaleMinimax';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { AwaleMove } from '../awale/AwaleMove';

describe('AwaleMove', () => {

    it('should have a bijective encoder', () => {
        const rules: AwaleRules = AwaleRules.get();
        const minimax: AwaleMinimax = new AwaleMinimax();
        const node: AwaleNode = rules.getInitialNode();
        const firstTurnMoves: AwaleMove[] = minimax.getListMoves(node);
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
