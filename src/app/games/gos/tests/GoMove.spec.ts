/* eslint-disable max-lines-per-function */
import { AbstractGoRules, GoNode } from '../AbstractGoRules';
import { GoMove } from '../GoMove';
import { EncoderTestUtils, MGPOptional } from '@everyboard/lib';
import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';
import { GoConfig, GoRules } from '../go/GoRules';
import { TriGoConfig, TriGoRules } from '../tri-go/TriGoRules';

describe('GoMove', () => {

    const rules: AbstractGoRules<GoConfig | TriGoConfig>[] = [
        GoRules.get(),
        TriGoRules.get(),
    ];
    for (const rule of rules) {
        it('should have a bijective encoder', () => {
            const moveGenerator: AbstractGoMoveGenerator = new AbstractGoMoveGenerator(rule);
            const defaultConfig: MGPOptional<GoConfig | TriGoConfig> = rule.getDefaultRulesConfig();
            const node: GoNode = rule.getInitialNode(defaultConfig);
            const firstTurnMoves: GoMove[] = moveGenerator.getListMoves(node);
            firstTurnMoves.push(GoMove.PASS);
            firstTurnMoves.push(GoMove.ACCEPT);
            for (const move of firstTurnMoves) {
                EncoderTestUtils.expectToBeBijective(GoMove.encoder, move);
            }
        });
    }

    it('should stringify nicely', () => {
        expect(GoMove.PASS.toString()).toBe('GoMove.PASS');
        expect(GoMove.ACCEPT.toString()).toBe('GoMove.ACCEPT');
        expect(new GoMove(0, 1).toString()).toBe('GoMove(0, 1)');
    });

});
