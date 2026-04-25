/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from '@everyboard/lib/testing';

import { MoveTestUtils } from '../../../jscaip/tests/Move.spec';
import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';
import { AbstractGoConfig, AbstractGoRules } from '../AbstractGoRules';
import { GoMove } from '../GoMove';
import { GoRules } from '../go/GoRules';
import { HexagonalGoRules } from '../hexagonal-go/HexagonalGoRules';
import { TriangularGoRules } from '../triangular-go/TriangularGoRules';


describe('GoMove', () => {

    const rules: AbstractGoRules<AbstractGoConfig>[] = [
        GoRules.get(),
        HexagonalGoRules.get(),
        TriangularGoRules.get(),
    ];
    for (const rule of rules) {
        it('should have a bijective encoder', () => {
            const moveGenerator: AbstractGoMoveGenerator<AbstractGoConfig> = new AbstractGoMoveGenerator(rule);
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
