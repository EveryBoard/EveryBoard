/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ApagosCoord } from '../ApagosCoord';
import { ApagosFailure } from '../ApagosFailure';
import { ApagosMove } from '../ApagosMove';

describe('ApagosMove', () => {

    it('should refuse creating static sliding', () => {
        // Given a move whose landing coord is lower than starting
        const invalidMove: MGPFallible<ApagosMove> = ApagosMove.transfer(ApagosCoord.ZERO, ApagosCoord.ZERO);
        // Then it should not be legal
        expect(invalidMove).toEqual(MGPFallible.failure(ApagosFailure.PIECE_SHOULD_MOVE_DOWNWARD()));
    });

    it('should refuse creating "climbing" slide', () => {
        // Given a move whose landing coord is lower than starting
        const invalidMove: MGPFallible<ApagosMove> = ApagosMove.transfer(ApagosCoord.ONE, ApagosCoord.TWO);
        // Then it should not be legal
        expect(invalidMove).toEqual(MGPFallible.failure(ApagosFailure.PIECE_SHOULD_MOVE_DOWNWARD()));
    });

    it('should have a bijective encoder', () => {
        const moves: ApagosMove[] = ApagosMove.ALL_MOVES;
        for (const move of moves) {
            EncoderTestUtils.expectToBeBijective(ApagosMove.encoder, move);
        }
    });

    it('should override equals correctly', () => {
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.ONE, Player.ZERO);
        const sameMove: ApagosMove = ApagosMove.drop(ApagosCoord.of(1), Player.ofTurn(0));
        const differentMove: ApagosMove = ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.ONE).get();
        const otherDifferentMove: ApagosMove = ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.TWO).get();
        expect(move.equals(sameMove)).toBeTrue();
        expect(move.equals(differentMove)).toBeFalse();
        expect(differentMove.equals(otherDifferentMove)).toBeFalse();
    });

});
