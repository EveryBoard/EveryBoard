import { Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Coord } from '../coord/Coord';
import { Encoder } from '../encoder';
import { HexaBoard } from './HexaBoard';

describe('HexaBoard', () => {
    const numEncoder: Encoder<number> = Encoder.numberEncoder(100);
    function numCompare(x: number, y: number): boolean {
        return x == y;
    }
    let board: HexaBoard<number>;
    beforeEach(() => {
        board = HexaBoard.empty(7, 7, 0, numEncoder);
    });
    describe('empty', () => {
        it('should create empty boards with empty cells', () => {
            expect(board.getAt(new Coord(0, 0))).toEqual(0);
        });
        it('should support rectangular boards', () => {
            const board: HexaBoard<number> = HexaBoard.empty(3, 7, 0, numEncoder);
            expect(board).toBeTruthy();
        });
        xit('should support even-sized boards', () => {
            const board: HexaBoard<number> = HexaBoard.empty(4, 8, 0, numEncoder);
            expect(board).toBeTruthy();
        });
    });
    describe('fromTable', () => {
        it('should throw when called with an empty table', () => {
            expect(() => HexaBoard.fromTable([], 0, numEncoder)).toThrow();
        });
        it('should compute the width and height from the table', () => {
            const board: HexaBoard<number> = HexaBoard.fromTable([[0, 0, 0]], 0, numEncoder);
            expect(board.width).toBe(3);
            expect(board.height).toBe(1);
        });
    });
    describe('equals', () => {
        it('should consider a board equal to itself', () => {
            expect(board.equals(board, (x: number, y: number) => {
                return x == y;
            })).toBeTrue();
        });
        it('should distinguish different boards due to different contents', () => {
            const board1: HexaBoard<number> = board;
            const board2: HexaBoard<number> = board.setAt(new Coord(-3, 1), 1);
            expect(board1.equals(board2, numCompare)).toBeFalse();
        });
        it('should distinguish different boards due to different width', () => {
            const board1: HexaBoard<number> = HexaBoard.empty(3, 3, 0, numEncoder);
            const board2: HexaBoard<number> = HexaBoard.empty(5, 3, 0, numEncoder);
            expect(board1.equals(board2, numCompare)).toBeFalse();
        });
        it('should distinguish different boards due to different encoders', () => {
            const board1: HexaBoard<number> = HexaBoard.empty(3, 3, 0, numEncoder);
            const board2: HexaBoard<number> = HexaBoard.empty(3, 3, 0, Encoder.numberEncoder(5));
            expect(board1.equals(board2, numCompare)).toBeFalse();
        });
        it('should distinguish different boards due to different empty coords', () => {
            const board1: HexaBoard<number> = HexaBoard.empty(3, 3, 0, numEncoder);
            const board2: HexaBoard<number> = HexaBoard.empty(3, 3, 1, numEncoder);
            expect(board1.equals(board2, numCompare)).toBeFalse();
        });
    });
    describe('getAt', () => {
        it('should fail when accessing coords not on board', () => {
            expect(() => board.getAt(new Coord(10, 5))).toThrow();
        });
        it('should return the right content', () => {
            const board: HexaBoard<number> = HexaBoard.fromTable([[0, 1, 0]], 0, numEncoder);
            expect(board.getAt(new Coord(0, 0))).toBe(1);
        });
    });
    describe('setAt', () => {
        it('should fail when setting a coord not on board', () => {
            expect(() => board.setAt(new Coord(10, 5), 5)).toThrow();
        });
        it('should return updated board upon modification', () => {
            const coord: Coord = new Coord(2, 1);
            const updated: HexaBoard<number> = board.setAt(coord, 42);
            expect(updated.getAt(coord)).toEqual(42);
        });
    });
    describe('forEachCoord', () => {
        it('should iterate over coords with forEachCoord', () => {
            let count: number = 0;
            board.forEachCoord((coord: Coord, _: number) => {
                count += 1;
            });
            expect(count).toEqual(37);
        });
    });
    describe('isOnBoard', () => {
        it('should detect when a coord is on the board', () => {
            expect(board.isOnBoard(new Coord(0, 0))).toBeTrue();
            expect(board.isOnBoard(new Coord(3, -3))).toBeTrue();
            expect(board.isOnBoard(new Coord(-2, -1))).toBeTrue();
        });
        it('should detect when a coord is not on the board', () => {
            expect(board.isOnBoard(new Coord(-4, 0))).toBeFalse();
            expect(board.isOnBoard(new Coord(0, 4))).toBeFalse();
            expect(board.isOnBoard(new Coord(3, 3))).toBeFalse();
            expect(board.isOnBoard(new Coord(10, -10))).toBeFalse();
        });
    });
    describe('isOnBorder', () => {
        it('should detect when a coord is on the border', () => {
            expect(board.isOnBorder(new Coord(-3, 1))).toBeTrue();
            expect(board.isOnBorder(new Coord(0, -3))).toBeTrue();
            expect(board.isOnBorder(new Coord(-2, -1))).toBeTrue();
        });
        it('should detect when a coord is not on the border', () => {
            expect(board.isOnBorder(new Coord(-2, 0))).toBeFalse();
            expect(board.isOnBorder(new Coord(0, 0))).toBeFalse();
            expect(board.isOnBorder(new Coord(2, -2))).toBeFalse();
        });
    });
    describe('getAllBorders', () => {
        it('should return 18 borders for a radius of 3', () => {
            expect(board.getAllBorders().length).toEqual(18);
        });
    });
    describe('toNumberTable', () => {
        it('should convert to a NumberTable using the encoder', () => {
            const encodeSpy: jasmine.Spy = spyOn(numEncoder, 'encode').and.callThrough();
            const table: Table<number> = board.toNumberTable();
            expect(table[3][3]).toBe(0);
            expect(encodeSpy).toHaveBeenCalledTimes(49);
        });
    });
});
