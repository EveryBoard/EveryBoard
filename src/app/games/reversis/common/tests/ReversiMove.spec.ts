/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from '@everyboard/lib/testing';

import { MoveTestUtils } from '../../../../jscaip/tests/Move.spec';
import { ReversiRules } from '../../reversi/ReversiRules';
import { ToricReversiRules } from '../../toric-reversi/ToricReversiRules';
import { AbstractReversiRules } from '../AbstractReversiRules';
import { ReversiMove } from '../ReversiMove';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';

describe('ReversiMove', () => {

    const rulesSets: { rules: AbstractReversiRules; name: string }[] = [
        { rules: ReversiRules.get(), name: 'Reversi' },
        { rules: ToricReversiRules.get(), name: 'Toric Reversi' },
    ];
    for (const rulesSet of rulesSets) {

        it(`should have a bijective encoder for ${ rulesSet.name }`, () => {
            const rules: ReversiRules = rulesSet.rules;
            const moveGenerator: ReversiMoveGenerator = new ReversiMoveGenerator(rules);
            MoveTestUtils.testFirstTurnMovesBijectivity(rules, moveGenerator, ReversiMove.encoder);
            EncoderTestUtils.expectToBeBijective(ReversiMove.encoder, ReversiMove.PASS);
        });

    }

});
