import { Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Coord } from '../coord/Coord';
import { Encoder } from '../encoder';
import { HexaBoard } from './HexaBoard';
import { HexaLine } from './HexaLine';

describe('HexaBoard', () => {
    function numCompare(x: number, y: number): boolean {
        return x === y;
    }
    let board: HexaBoard<number>;
    beforeEach(() => {
        board = HexaBoard.empty(7, 7, [3, 2, 1], 0);
    });
    describe('empty', () => {
        it('should create empty boards with empty cells', () => {
            expect(board.getAt(new Coord(2, 2))).toEqual(0);
        });
        it('should support rectangular boards', () => {
            const board: HexaBoard<number> = HexaBoard.empty(3, 7, [1], 0);
            expect(board).toBeTruthy();
        });
        xit('should support even-sized boards', () => {
            const board: HexaBoard<number> = HexaBoard.empty(4, 8, [1], 0);
            expect(board).toBeTruthy();
        });
        it('should throw when excluded case specification is incorrect', () => {
            expect(() => HexaBoard.empty(7, 7, [1, 1, 1, 1, 1], 0)).toThrow();
        });
    });
    describe('fromTable', () => {
        it('should throw when called with an empty table', () => {
            expect(() => HexaBoard.fromTable([], [], 0)).toThrow();
        });
        it('should compute the width and height from the table', () => {
            const board: HexaBoard<number> = HexaBoard.fromTable([[0, 0, 0]], [], 0);
            expect(board.width).toBe(3);
            expect(board.height).toBe(1);
        });
    });
    describe('equals', () => {
        it('should consider a board equal to itself', () => {
            expect(board.equals(board, (x: number, y: number) => {
                return x === y;
            })).toBeTrue();
        });
        it('should distinguish different boards due to different contents', () => {
            const board1: HexaBoard<number> = board;
            const board2: HexaBoard<number> = board.setAt(new Coord(4, 4), 1);
            expect(board1.equals(board2, numCompare)).toBeFalse();
        });
        it('should distinguish different boards due to different width', () => {
            const board1: HexaBoard<number> = HexaBoard.empty(3, 3, [1], 0);
            const board2: HexaBoard<number> = HexaBoard.empty(5, 3, [1], 0);
            expect(board1.equals(board2, numCompare)).toBeFalse();
        });
        it('should distinguish different boards due to different width', () => {
            const board1: HexaBoard<number> = HexaBoard.empty(3, 3, [1], 0);
            const board2: HexaBoard<number> = HexaBoard.empty(3, 5, [1], 0);
            expect(board1.equals(board2, numCompare)).toBeFalse();
        });
        it('should distinguish different boards due to different empty coords', () => {
            const board1: HexaBoard<number> = HexaBoard.empty(3, 3, [1], 0);
            const board2: HexaBoard<number> = HexaBoard.empty(3, 3, [1], 1);
            expect(board1.equals(board2, numCompare)).toBeFalse();
        });
    });
    describe('getAt', () => {
        it('should fail when accessing coords not on board', () => {
            expect(() => board.getAt(new Coord(10, 5))).toThrow();
        });
        it('should return the right content', () => {
            const board: HexaBoard<number> = HexaBoard.fromTable([[0, 1, 0]], [], 0);
            expect(board.getAt(new Coord(1, 0))).toBe(1);
        });
    });
    describe('setAt', () => {
        it('should fail when setting a coord not on board', () => {
            expect(() => board.setAt(new Coord(10, 5), 5)).toThrow();
        });
        it('should return updated board upon modification', () => {
            const coord: Coord = new Coord(4, 3);
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
            expect(board.isOnBoard(new Coord(3, 3))).toBeTrue();
        });
        it('should detect when a coord is not on the board', () => {
            expect(board.isOnBoard(new Coord(10, 5))).toBeFalse();
            expect(board.isOnBoard(new Coord(3, -3))).toBeFalse();
            expect(board.isOnBoard(new Coord(0, 0))).toBeFalse();
            expect(board.isOnBoard(new Coord(0, 8))).toBeFalse();
        });
    });
    describe('allLines', () => {
        it('should countain 21 different lines', () => {
            const lines: ReadonlyArray<HexaLine> = board.allLines();
            expect(lines.length).toEqual(21);
            for (const line1 of lines) {
                let eq: number = 0;
                for (const line2 of lines) {
                    if (line1.equals(line2)) {
                        eq += 1;
                    }
                }
                // Line should be unique
                expect(eq).toEqual(1);
            }
        });
    });
});
