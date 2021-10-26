import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ApagosCoord } from '../ApagosCoord';
import { ApagosMessage } from '../ApagosMessage';
import { ApagosMove } from '../ApagosMove';
import { ApagosRules } from '../ApagosRules';
import { ApagosState } from '../ApagosState';

fdescribe('ApagosMove', () => {

    it('should refuse creating immobile sliding', () => {
        // given a move whose landing coord is lower than starting
        const invalidMove: MGPFallible<ApagosMove> = ApagosMove.slideDown(ApagosCoord.ZERO, ApagosCoord.ZERO);
        // then it should not be legal
        expect(invalidMove).toEqual(MGPFallible.failure(ApagosMessage.PIECE_SHOULD_MOVE_DOWNWARD()));
    });
    it('should refuse creating "climbing" slide', () => {
        // given a move whose landing coord is lower than starting
        const invalidMove: MGPFallible<ApagosMove> = ApagosMove.slideDown(ApagosCoord.ONE, ApagosCoord.TWO);
        // then it should not be legal
        expect(invalidMove).toEqual(MGPFallible.failure(ApagosMessage.PIECE_SHOULD_MOVE_DOWNWARD()));
    });
    it('ApagosMove.encoder should be correct', () => {
        // TODOTODO
        // const rules: ApagosRules = new ApagosRules(ApagosState);
        // const minimax: ApagosMinimax = new ApagosMinimax(rules, 'ApagosMinimax');
        // const firstTurnMoves: ApagosMove[] = minimax.getListMoves(rules.node);
        // for (const move of firstTurnMoves) {
        //     NumberEncoderTestUtils.expectToBeCorrect(ApagosMove.encoder, move);
        // }
    });
    it('Should override equals correctly', () => {
        // TODOTODO
    });
});
