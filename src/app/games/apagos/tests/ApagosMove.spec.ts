import { Player } from 'src/app/jscaip/Player';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ApagosCoord } from '../ApagosCoord';
import { ApagosFailure } from '../ApagosFailure';
import { ApagosMove } from '../ApagosMove';

describe('ApagosMove', () => {

    it('should refuse creating immobile sliding', () => {
        // given a move whose landing coord is lower than starting
        const invalidMove: MGPFallible<ApagosMove> = ApagosMove.transfer(ApagosCoord.ZERO, ApagosCoord.ZERO);
        // then it should not be legal
        expect(invalidMove).toEqual(MGPFallible.failure(ApagosFailure.PIECE_SHOULD_MOVE_DOWNWARD()));
    });
    it('should refuse creating "climbing" slide', () => {
        // given a move whose landing coord is lower than starting
        const invalidMove: MGPFallible<ApagosMove> = ApagosMove.transfer(ApagosCoord.ONE, ApagosCoord.TWO);
        // then it should not be legal
        expect(invalidMove).toEqual(MGPFallible.failure(ApagosFailure.PIECE_SHOULD_MOVE_DOWNWARD()));
    });
    it('ApagosMove.encoder should be correct', () => {
        const moves: ApagosMove[] = ApagosMove.ALL_MOVES;
        for (const move of moves) {
            NumberEncoderTestUtils.expectToBeCorrect(ApagosMove.encoder, move);
        }
    });
    it('Should override equals correctly', () => {
        const move: ApagosMove = ApagosMove.drop(ApagosCoord.ONE, Player.ZERO);
        const sameMove: ApagosMove = ApagosMove.drop(ApagosCoord.from(1), Player.fromTurn(0));
        const differentMove: ApagosMove = ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.ONE).get();
        expect(move.equals(sameMove)).toBeTrue();
        expect(move.equals(differentMove)).toBeFalse();
    });
});
