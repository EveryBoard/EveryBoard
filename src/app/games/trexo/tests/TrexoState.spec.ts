import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { TrexoPiece, TrexoPieceStack, TrexoState } from '../TrexoState';

describe('TrexoState', () => {
    it('should refuse creating a board of which width is not 10', () => {
        const error: string = 'Invalid board dimensions';
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        // Given a 11x10 board
        const board: TrexoPieceStack[][] = ArrayUtils.createTable(11, 10, TrexoPieceStack.EMPTY);

        // When passing it as an argument
        // Then it should fail
        expect(() => TrexoState.of(board, 0)).toThrowError('Assertion failure: ' + error);
        expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('Assertion failure', error);
    });
    it('should refuse creating a board of which height is not 10', () => {
        const error: string = 'Invalid board dimensions';
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        // Given a 10x11 board
        const board: TrexoPieceStack[][] = ArrayUtils.createTable(10, 11, TrexoPieceStack.EMPTY);

        // When passing it as an argument
        // Then it should fail
        expect(() => TrexoState.of(board, 0)).toThrowError('Assertion failure: ' + error);
        expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('Assertion failure', error);
    });
    it('should drop piece at the lowest level possible', () => {
        // Given an empty board
        const state: TrexoState = TrexoState.getInitialState();

        // When trying to add piece
        const owner: Player = Player.ZERO;
        const dropTurn: number = 0;
        const coord: Coord = new Coord(0, 0);
        const nextState: TrexoState = state.drop(coord, owner);

        // Then it should be dropped at the lowest level
        const piece: TrexoPiece = new TrexoPiece(owner, dropTurn);
        expect(nextState.getPieceAt(coord)).toEqual(TrexoPieceStack.of([piece]));
    });
});
