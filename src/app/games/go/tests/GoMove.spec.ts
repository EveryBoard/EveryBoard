/* eslint-disable max-lines-per-function */
import { GoConfig, GoNode, GoRules } from '../GoRules';
import { GoMove } from '../GoMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { GoMoveGenerator } from '../GoMoveGenerator';

const config: GoConfig = { width: 5, height: 5, handicap: 0 };

describe('GoMove', () => {

    it('should have a bijective encoder', () => {
        const rules: GoRules = GoRules.get();
        const moveGenerator: GoMoveGenerator = new GoMoveGenerator();
        const node: GoNode = rules.getInitialNode(config);
        const firstTurnMoves: GoMove[] = moveGenerator.getListMoves(node);
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
