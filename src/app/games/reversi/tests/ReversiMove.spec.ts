/* eslint-disable max-lines-per-function */
import { ReversiRules } from '../ReversiRules';
import { ReversiMinimax } from '../ReversiMinimax';
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { NumberEncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';

describe('ReversiMove', () => {

    it('should have a bijective encoder', () => {
        const rules: ReversiRules = new ReversiRules(ReversiState);
        const minimax: ReversiMinimax = new ReversiMinimax(rules, 'ReversiMinimax');
        const moves: ReversiMove[] = minimax.getListMoves(rules.node);
        moves.push(ReversiMove.PASS);
        for (const move of moves) {
            NumberEncoderTestUtils.expectToBeBijective(ReversiMove.encoder, move);
        }
    });
});
