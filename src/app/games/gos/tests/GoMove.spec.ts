/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from '@everyboard/lib';
import { AbstractGoRules } from '../AbstractGoRules';
import { GoMove } from '../GoMove';
import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';
import { GoRules } from '../go/GoRules';
import { TrigoRules } from '../trigo/TrigoRules';
import { MoveTestUtils } from 'src/app/jscaip/tests/Move.spec';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('GoMove', () => {

    const rules: AbstractGoRules<RulesConfig>[] = [
        GoRules.get(),
        TrigoRules.get(),
    ];
    for (const rule of rules) {
        it('should have a bijective encoder', () => {
            const moveGenerator: AbstractGoMoveGenerator<RulesConfig> = new AbstractGoMoveGenerator(rule);
            const passAndAccept: GoMove[] = [
                GoMove.PASS,
                GoMove.ACCEPT,
            ];
            for (const move of passAndAccept) {
                EncoderTestUtils.expectToBeBijective(GoMove.encoder, move);
            }
            MoveTestUtils.testFirstTurnMovesBijectivity(rule, moveGenerator, GoMove.encoder);
        });
    }

    it('should stringify nicely', () => {
        expect(GoMove.PASS.toString()).toBe('GoMove.PASS');
        expect(GoMove.ACCEPT.toString()).toBe('GoMove.ACCEPT');
        expect(new GoMove(0, 1).toString()).toBe('GoMove(0, 1)');
    });

});
