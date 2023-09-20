/* eslint-disable max-lines-per-function */
import { GoNode, GoRules } from '../GoRules';
import { GoMinimax } from '../GoMinimax';
import { GoMove } from '../GoMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { GobanConfig } from 'src/app/jscaip/GobanConfig';

const config: GobanConfig = { width: 5, height: 5 };

describe('GoMove', () => {

    it('should have a bijective encoder', () => {
        const rules: GoRules = GoRules.get();
        const minimax: GoMinimax = new GoMinimax(rules, 'GoMinimax');
        const node: GoNode = rules.getInitialNode(config);
        const firstTurnMoves: GoMove[] = minimax.getListMoves(node);
        firstTurnMoves.push(GoMove.PASS);
        firstTurnMoves.push(GoMove.ACCEPT);
        for (const move of firstTurnMoves) {
            EncoderTestUtils.expectToBeBijective(GoMove.encoder, move);
        }
    });
    it('should stringify nicely', () => {
        expect(GoMove.PASS.toString()).toBe('GoMove.PASS');
        expect(GoMove.ACCEPT.toString()).toBe('GoMove.ACCEPT');
        expect(new GoMove(0, 1).toString()).toBe('GoMove(0, 1)');
    });
});
