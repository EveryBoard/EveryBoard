/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from '@everyboard/lib/testing';

import { MoveTestUtils } from '../../../../jscaip/tests/Move.spec';
import { ReversiRules } from '../../reversi/ReversiRules';
import { ToricReversiRules } from '../../toric-reversi/ToricReversiRules';
import { TopologicReversiRules } from '../AbstractReversiRules';
import { ReversiMove } from '../ReversiMove';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';

describe('ReversiMove', () => {

    const rules: TopologicReversiRules[] = [
        ReversiRules.get(),
        ToricReversiRules.get(),
    ];
    for (const rule of rules) {

        it(`should have a bijective encoder for ${ rule.constructor.name }`, () => {
            const moveGenerator: ReversiMoveGenerator = new ReversiMoveGenerator(rule);
            MoveTestUtils.testFirstTurnMovesBijectivity(rule, moveGenerator, ReversiMove.encoder);
            EncoderTestUtils.expectToBeBijective(ReversiMove.encoder, ReversiMove.PASS);
        });

    }

});
