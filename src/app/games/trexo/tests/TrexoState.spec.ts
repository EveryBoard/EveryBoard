import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TrexoFailure } from '../TrexoFailure';
import { TrexoSpace, TrexoState } from '../TrexoState';

describe('TrexoState', () => {
    it('should refuse creating a board that is not a Nx10', () => {
        // Given a 11x10 board
        const board: TrexoSpace[][] = ArrayUtils.createTable(11, 10, TrexoSpace.EMPTY);

        // When passing it as a param
        const state: MGPFallible<TrexoState> = TrexoState.from(board, 0);

        // Then it should fail
        expect(state.getReason()).toBe(TrexoFailure.INVALID_DIMENSIONS());
    });
    it('should refuse creating a board that is not a 10xN', () => {
        // Given a 10x11 board
        const board: TrexoSpace[][] = ArrayUtils.createTable(10, 11, TrexoSpace.EMPTY);

        // When passing it as a param
        const state: MGPFallible<TrexoState> = TrexoState.from(board, 0);

        // Then it should fail
        expect(state.getReason()).toBe(TrexoFailure.INVALID_DIMENSIONS());
    });
    it('should drop piece at the lower level possible', () => {
        // Given an empty board
        const state: TrexoState = TrexoState.getInitialState();

        // When trying to add piece
        const owner: Player = Player.ZERO;
        const dropTurn: number = 0;
        const coord: Coord = new Coord(0, 0);
        const nextState: TrexoState = state.drop(coord, owner);

        // Then it should be dropped at the lower level
        expect(nextState.getPieceAt(coord)).toEqual(new TrexoSpace(owner, 1, dropTurn));
    });
});
