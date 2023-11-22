/* eslint-disable max-lines-per-function */
import { ReversiConfig, ReversiRules } from '../ReversiRules';
import { ReversiMove } from '../ReversiMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { MoveTestUtils } from 'src/app/jscaip/tests/Move.spec';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';

describe('ReversiMove', () => {

    it('should have a bijective encoder', () => {
        const rules: ReversiRules = ReversiRules.get();
        const defaultConfig: ReversiConfig = rules.getRulesConfigDescription().defaultConfig.config;
        const moveGenerator: ReversiMoveGenerator = new ReversiMoveGenerator();
        MoveTestUtils.testFirstTurnMovesBijectivity(rules, moveGenerator, ReversiMove.encoder, defaultConfig);
        EncoderTestUtils.expectToBeBijective(ReversiMove.encoder, ReversiMove.PASS);
    });
});
