import { Coord } from 'src/app/jscaip/coord/Coord';
import { Player } from 'src/app/jscaip/player/Player';
import { Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { GoPartSlice, GoPiece, Phase } from '../GoPartSlice';

describe('GoPartSlice', () => {

    it('Should throw when GoPiece.pieceBelongTo is called with Player.NONE', () => {
        const error: string = 'Owner must be Player.ZERO or Player.ONE, got Player.NONE.';
        expect(() => GoPiece.pieceBelongTo(GoPiece.BLACK, Player.NONE)).toThrowError(error);
    });
    it('Should throw when GoPiece.of is called with invalid number', () => {
        const error: string = 'Invalid value for GoPiece: 123.';
        expect(() => GoPiece.of(123)).toThrowError(error);
    });
    it('Should throw when constructor called with capture or phase as null', () => {
        const board: Table<GoPiece> = [];
        const captured: number[] = [];
        const turn: number = 1;
        const koCoord: MGPOptional<Coord> = MGPOptional.empty();
        const phase: Phase = Phase.ACCEPT;
        expect(() => new GoPartSlice(board, null, turn, koCoord, phase)).toThrowError('Captured cannot be null.');
        expect(() => new GoPartSlice(board, captured, turn, null, phase))
            .toThrowError('Ko Coord cannot be null, use MGPOptional.empty() instead.');
        expect(() => new GoPartSlice(board, captured, turn, koCoord, null)).toThrowError('Phase cannot be null.');
    });
});
