import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GoState, GoPiece, Phase } from '../GoState';

describe('GoState', () => {

    describe('GoPiece', () => {
        describe('GoPiece.of', () => {
            it('should map correctly all pieces', () => {
                expect(GoPiece.of(0)).toBe(GoPiece.BLACK);
                expect(GoPiece.of(1)).toBe(GoPiece.WHITE);
                expect(GoPiece.of(2)).toBe(GoPiece.EMPTY);
                expect(GoPiece.of(3)).toBe(GoPiece.DEAD_BLACK);
                expect(GoPiece.of(4)).toBe(GoPiece.DEAD_WHITE);
                expect(GoPiece.of(5)).toBe(GoPiece.BLACK_TERRITORY);
                expect(GoPiece.of(6)).toBe(GoPiece.WHITE_TERRITORY);
            });
            it('Should throw when GoPiece.of is called with invalid number', () => {
                const error: string = 'Invalid value for GoPiece: 123.';
                expect(() => GoPiece.of(123)).toThrowError(error);
            });
        });
        it('Should throw when GoPiece.pieceBelongTo is called with Player.NONE', () => {
            const error: string = 'Assertion failure: Owner must be Player.ZERO or Player.ONE, got Player.NONE.';
            expect(() => GoPiece.pieceBelongTo(GoPiece.BLACK, Player.NONE)).toThrowError(error);
        });
    });
    it('Should throw when constructor called with capture or phase as null', () => {
        const board: Table<GoPiece> = [];
        const captured: number[] = [];
        const turn: number = 1;
        const koCoord: MGPOptional<Coord> = MGPOptional.empty();
        const phase: Phase = Phase.ACCEPT;
        expect(() => new GoState(board, null, turn, koCoord, phase)).toThrowError('Captured cannot be null.');
        expect(() => new GoState(board, captured, turn, null, phase))
            .toThrowError('Ko Coord cannot be null, use MGPOptional.empty() instead.');
        expect(() => new GoState(board, captured, turn, koCoord, null)).toThrowError('Phase cannot be null.');
    });
});
