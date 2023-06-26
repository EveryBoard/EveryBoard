/* eslint-disable max-lines-per-function */
import { AwaleNode, AwaleRules } from '../awale/AwaleRules';
import { AwaleMinimax } from '../awale/AwaleMinimax';
import { MancalaMove } from '../commons/MancalaMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';

describe('MancalaMove', () => {

    it('should have a bijective encoder', () => {
        const rules: AwaleRules = AwaleRules.get();
        const minimax: AwaleMinimax = new AwaleMinimax();
        const node: AwaleNode = rules.getInitialNode();
        const firstTurnMoves: MancalaMove[] = minimax.getListMoves(node);
        for (const move of firstTurnMoves) {
            EncoderTestUtils.expectToBeBijective(MancalaMove.encoder, move);
        }
    });
    it('should override equals correctly', () => {
        const move: MancalaMove = MancalaMove.ZERO;
        const other: MancalaMove = MancalaMove.ONE;
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(other)).toBeFalse();
    });
});
