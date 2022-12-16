import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TrexoMove, TrexoMoveFailure } from '../TrexoMove';
import { TrexoState } from '../TrexoState';

fdescribe('TrexoMove', () => {
    it('should refuse to create out of board move (player.zero piece)', () => {
        // When coord of piece zero is out of range
        const zero: Coord = new Coord(-1, 0);
        const one: Coord = new Coord(0, 0);

        // When trying to pass it as param
        const move: MGPFallible<TrexoMove> = TrexoMove.from(zero, one);

        // Then it should fail
        expect(move.getReason()).toBe('TODOTODO OUT OF RANGE FROM Lasca');
    });
    it('should refuse to create out of board move (player.one piece)', () => {
        // When coord of piece one is out of range
        const zero: Coord = new Coord(9, 9);
        const one: Coord = new Coord(TrexoState.SIZE, 9);

        // When trying to pass it as param
        const move: MGPFallible<TrexoMove> = TrexoMove.from(zero, one);

        // Then it should fail
        expect(move.getReason()).toBe('TODOTODO OUT OF RANGE FROM Lasca');
    });
    it('should refuse to create move with two coord not neighbors', () => {
        // When two non neighboring coord
        const zero: Coord = new Coord(0, 0);
        const one: Coord = new Coord(2, 0);

        // When trying to pass them as param
        const move: MGPFallible<TrexoMove> = TrexoMove.from(zero, one);

        // Then it should fail
        expect(move.getReason()).toBe(TrexoMoveFailure.NON_NEIGHBOR_COORDS());
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
});
