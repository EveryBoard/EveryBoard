import { ReversiRules } from '../ReversiRules';
import { ReversiMinimax } from '../ReversiMinimax';
import { ReversiMove } from '../ReversiMove';
import { ReversiPartSlice } from '../ReversiPartSlice';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';

describe('ReversiMove', () => {
    it('ReversiMove.encoder should be correct', () => {
        const rules: ReversiRules = new ReversiRules(ReversiPartSlice);
        const minimax: ReversiMinimax = new ReversiMinimax(rules, 'ReversiMinimax');
        const moves: ReversiMove[] = minimax.getListMoves(rules.node);
        moves.push(ReversiMove.PASS);
        for (const move of moves) {
            NumberEncoderTestUtils.expectToBeCorrect(ReversiMove.encoder, move);
        }
    });
});
