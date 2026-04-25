/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from '@everyboard/lib/testing';

import { MoveTestUtils } from '../../../jscaip/tests/Move.spec';
import { ReversiMove } from '../ReversiMove';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';
import { ReversiRules } from '../ReversiRules';

describe('ReversiMove', () => {

    it('should have a bijective encoder', () => {
        const rules: ReversiRules = ReversiRules.get();
        const moveGenerator: ReversiMoveGenerator = new ReversiMoveGenerator();
        MoveTestUtils.testFirstTurnMovesBijectivity(rules, moveGenerator, ReversiMove.encoder);
        EncoderTestUtils.expectToBeBijective(ReversiMove.encoder, ReversiMove.PASS);
    });

});
