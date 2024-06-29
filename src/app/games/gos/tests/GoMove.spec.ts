/* eslint-disable max-lines-per-function */
import { AbstractGoRules } from '../AbstractGoRules';
import { GoMove } from '../GoMove';
import { EncoderTestUtils } from '@everyboard/lib';
import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';
import { GoConfig, GoRules } from '../go/GoRules';
import { TrigoConfig, TrigoRules } from '../trigo/TrigoRules';
import { MoveTestUtils } from 'src/app/jscaip/tests/Move.spec';

describe('GoMove', () => {

    const rules: AbstractGoRules<GoConfig | TrigoConfig>[] = [
        GoRules.get(),
        TrigoRules.get(),
    ];
    for (const rule of rules) {
        it('should have a bijective encoder', () => {
            const moveGenerator: AbstractGoMoveGenerator = new AbstractGoMoveGenerator(rule);
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
