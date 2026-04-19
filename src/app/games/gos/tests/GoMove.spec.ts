/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from '@everyboard/lib/testing';

import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { MoveTestUtils } from '../../../jscaip/tests/Move.spec';
import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';
import { AbstractGoRules } from '../AbstractGoRules';
import { GoMove } from '../GoMove';
import { GoRules } from '../go/GoRules';
import { HexagonalGoRules } from '../hexagonal-go/HexagonalGoRules';
import { TrigoRules } from '../trigo/TrigoRules';

describe('GoMove', () => {

    const rules: AbstractGoRules<RulesConfig>[] = [
        GoRules.get(),
        HexagonalGoRules.get(),
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
