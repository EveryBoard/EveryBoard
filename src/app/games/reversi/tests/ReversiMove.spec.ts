/* eslint-disable max-lines-per-function */
import { ReversiNode, ReversiRules } from '../ReversiRules';
import { ReversiMoveGenerator } from '../ReversiMinimax';
import { ReversiMove } from '../ReversiMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';

describe('ReversiMove', () => {

    it('should have a bijective encoder', () => {
        const rules: ReversiRules = ReversiRules.get();
        const minimax: ReversiMoveGenerator = new ReversiMoveGenerator();
        const node: ReversiNode = rules.getInitialNode();
        const moves: ReversiMove[] = minimax.getListMoves(node);
        moves.push(ReversiMove.PASS);
        for (const move of moves) {
            EncoderTestUtils.expectToBeBijective(ReversiMove.encoder, move);
        }
    });
});
