/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { TableUtils } from 'src/app/jscaip/TableUtils';
import { TrexoPiece, TrexoPieceStack, TrexoState } from '../TrexoState';
import { TrexoRules } from '../TrexoRules';

describe('TrexoState', () => {
    it('should refuse creating a board of which width is not 10', () => {
        const error: string = 'Invalid board dimensions';
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        // Given a 11x10 board
        const board: TrexoPieceStack[][] = TableUtils.create(11, 10, TrexoPieceStack.EMPTY);

        // When passing it as an argument
        // Then it should fail
        expect(() => TrexoState.of(board, 0)).toThrowError('Assertion failure: ' + error);
        expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('Assertion failure', error);
    });
    it('should refuse creating a board of which height is not 10', () => {
        const error: string = 'Invalid board dimensions';
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        // Given a 10x11 board
        const board: TrexoPieceStack[][] = TableUtils.create(10, 11, TrexoPieceStack.EMPTY);

        // When passing it as an argument
        // Then it should fail
        expect(() => TrexoState.of(board, 0)).toThrowError('Assertion failure: ' + error);
        expect(ErrorLoggerService.logError).toHaveBeenCalledOnceWith('Assertion failure', error);
    });
    it('should drop piece at the lowest level possible', () => {
        // Given an empty board
        const state: TrexoState = TrexoRules.get().getInitialState();

        // When trying to add piece
        const owner: Player = Player.ZERO;
        const dropTurn: number = 0;
        const coord: Coord = new Coord(0, 0);
        const nextState: TrexoState = state.drop(coord, owner);

        // Then it should be dropped at the lowest level
        const piece: TrexoPiece = new TrexoPiece(owner, dropTurn);
        expect(nextState.getPieceAt(coord)).toEqual(TrexoPieceStack.of([piece]));
    });
    describe('toString', () => {
        const ______: TrexoPieceStack = TrexoPieceStack.EMPTY;
        const O1__T0: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ZERO, 0)]);
        const O1__T1: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ZERO, 1)]);
        const O2__T2: TrexoPieceStack = TrexoPieceStack.of([
            new TrexoPiece(Player.ZERO, 0),
            new TrexoPiece(Player.ZERO, 2),
        ]);
        const O1__T3: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ZERO, 3)]);
        const X1__T0: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ONE, 0)]);
        const X1__T1: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ONE, 1)]);
        const X2__T2: TrexoPieceStack = TrexoPieceStack.of([
            new TrexoPiece(Player.ONE, 0),
            new TrexoPiece(Player.ONE, 2),
        ]);
        const X1__T3: TrexoPieceStack = TrexoPieceStack.of([new TrexoPiece(Player.ONE, 3)]);
        it('should display state', () => {
            const state: TrexoState = TrexoState.of([
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, O1__T0, ______, O2__T2, ______, ______, ______, ______],
                [______, ______, ______, X1__T0, X1__T1, X2__T2, X1__T3, ______, ______, ______],
                [______, ______, ______, ______, O1__T1, ______, O1__T3, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
            ], 4);
            const representation: string = `[TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([])]
,[TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([])]
,[TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([(TrexoPiece(PLAYER_ZERO, 0))]), TrexoPieceStack.of([]), TrexoPieceStack.of([(TrexoPiece(PLAYER_ZERO, 0)) (TrexoPiece(PLAYER_ZERO, 2))]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([])]
,[TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([(TrexoPiece(PLAYER_ONE, 0))]), TrexoPieceStack.of([(TrexoPiece(PLAYER_ONE, 1))]), TrexoPieceStack.of([(TrexoPiece(PLAYER_ONE, 0)) (TrexoPiece(PLAYER_ONE, 2))]), TrexoPieceStack.of([(TrexoPiece(PLAYER_ONE, 3))]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([])]
,[TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([(TrexoPiece(PLAYER_ZERO, 1))]), TrexoPieceStack.of([]), TrexoPieceStack.of([(TrexoPiece(PLAYER_ZERO, 3))]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([])]
,[TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([])]
,[TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([])]
,[TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([])]
,[TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([])]
,[TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([]), TrexoPieceStack.of([])]`;
            expect(state.toString()).toBe(representation);
        });
    });
});
