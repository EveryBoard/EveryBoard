/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { TrexoFailure } from '../TrexoFailure';
import { TrexoMinimax } from '../TrexoMinimax';
import { TrexoMove } from '../TrexoMove';
import { TrexoRules } from '../TrexoRules';
import { TrexoState } from '../TrexoState';

describe('TrexoMove', () => {

    it('should refuse to create out of board move (player.zero piece)', () => {
        // Given two coords of piece, with the zero coord being out of range
        const zero: Coord = new Coord(-1, 0);
        const one: Coord = new Coord(0, 0);

        // When trying to pass it as param
        const move: MGPFallible<TrexoMove> = TrexoMove.from(zero, one);

        // Then it should fail
        expect(move.getReason()).toBe('(-1, 0) is out of the board!');
    });
    it('should refuse to create out of board move (player.one piece)', () => {
        // Given two coords of piece, with the one coord being out of range
        const zero: Coord = new Coord(9, 9);
        const one: Coord = new Coord(TrexoState.SIZE, 9);

        // When trying to pass it as param
        const move: MGPFallible<TrexoMove> = TrexoMove.from(zero, one);

        // Then it should fail
        expect(move.getReason()).toBe('(' + TrexoState.SIZE + ', 9) is out of the board!');
    });
    it('should refuse to create move with two coord not neighbors', () => {
        // Given two non neighboring coords
        const zero: Coord = new Coord(0, 0);
        const one: Coord = new Coord(2, 0);

        // When trying to pass them as param
        const move: MGPFallible<TrexoMove> = TrexoMove.from(zero, one);

        // Then it should fail
        expect(move.getReason()).toBe(TrexoFailure.NON_NEIGHBORING_SPACES());
    });
    it('should succeed creating legal move', () => {
        // Given two in-board neighbors coords
        const zero: Coord = new Coord(2, 2);
        const one: Coord = new Coord(2, 3);

        // When passing them as a param
        const move: MGPFallible<TrexoMove> = TrexoMove.from(zero, one);

        // Then it should succeed
        expect(move.isSuccess()).toBeTrue();
    });
    it('should have a bijective encoder', () => {
        const rules: TrexoRules = TrexoRules.get();
        const minimax: TrexoMinimax = new TrexoMinimax(rules, 'dummy');
        const firstTurnMoves: TrexoMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            EncoderTestUtils.expectToBeBijective(TrexoMove.encoder, move);
        }
    });
    describe('equals', () => {
        it('should be true when two move are equal', () => {
            // Given two identical moves
            const first: TrexoMove = TrexoMove.from(new Coord(0, 0), new Coord(1, 0)).get();
            const second: TrexoMove = TrexoMove.from(new Coord(0, 0), new Coord(1, 0)).get();

            // When comparing them
            const equals: boolean = first.equals(second);

            // Then it should be true
            expect(equals).toBeTrue();
        });
        it('should be false when two first coords are differents', () => {
            // Given two moves with a different first coord
            const first: TrexoMove = TrexoMove.from(new Coord(0, 0), new Coord(1, 0)).get();
            const second: TrexoMove = TrexoMove.from(new Coord(2, 0), new Coord(1, 0)).get();

            // When comparing them
            const equals: boolean = first.equals(second);

            // Then it should be true
            expect(equals).toBeFalse();
        });
        it('should be false when two second coords are differents', () => {
            // Given two moves with a different second coord
            const first: TrexoMove = TrexoMove.from(new Coord(1, 0), new Coord(2, 0)).get();
            const second: TrexoMove = TrexoMove.from(new Coord(1, 0), new Coord(0, 0)).get();

            // When comparing them
            const equals: boolean = first.equals(second);

            // Then it should be true
            expect(equals).toBeFalse();
        });
    });
});
