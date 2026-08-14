/* eslint-disable max-lines-per-function */
import { MoveTestUtils } from '@everyboard/games';
import { EncoderTestUtils } from '@everyboard/lib/testing';

import { ReversiRules } from '../../reversi/ReversiRules';
import { ToricReversiRules } from '../../toric-reversi/ToricReversiRules';
import { AbstractReversiRules } from '../AbstractReversiRules';
import { ReversiMove } from '../ReversiMove';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';

describe('ReversiMove', () => {

    const rules: AbstractReversiRules[] = [
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
