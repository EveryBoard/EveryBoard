import { QuartoRules } from '../QuartoRules';
import { QuartoMinimax } from '../QuartoMinimax';
import { QuartoMove } from '../QuartoMove';
import { QuartoState } from '../QuartoState';
import { QuartoPiece } from '../QuartoPiece';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';

describe('QuartoMove', () => {

    it('QuartoMove.encoder should be correct', () => {
        const rules: QuartoRules = new QuartoRules(QuartoState);
        const minimax: QuartoMinimax = new QuartoMinimax(rules, 'QuartoMinimax');
        const firstTurnMoves: QuartoMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            NumberEncoderTestUtils.expectToBeCorrect(QuartoMove.encoder, move);
        }
    });
    it('should override toString and equals correctly', () => {
        const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.AAAB);
        const secondMove: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAB);
        const thirdMove: QuartoMove = new QuartoMove(1, 1, QuartoPiece.AAAA);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(secondMove)).toBeFalse();
        expect(move.equals(thirdMove)).toBeFalse();
        expect(move.toString()).toEqual('QuartoMove(1, 1, 1)');
    });
});
