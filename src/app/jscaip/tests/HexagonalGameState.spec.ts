import { ArrayUtils, NumberTable } from 'src/app/utils/ArrayUtils';
import { Coord } from '../Coord';
import { HexagonalGameState } from '../HexagonalGameState';
import { HexaLine } from '../HexaLine';

export class TestingHexagonalState extends HexagonalGameState<number> {

    public static readonly NONE: number = -1;

    public static empty(width: number,
                        height: number,
                        excludedCases: ReadonlyArray<number>,
                        empty: number)
    : TestingHexagonalState
    {
        const newBoard: number[][] = ArrayUtils.createTable(width, height, empty);
        let y: number = 0;
        for (const excluded of excludedCases) {
            for (let i: number = 0; i < excluded; i++) {
                newBoard[y][i] = TestingHexagonalState.NONE;
                newBoard[height - (y + 1)][width - (i + 1)] = TestingHexagonalState.NONE;
            }
            y++;
        }
        return new TestingHexagonalState(0, newBoard, width, height, excludedCases, empty);
    }
    public static fromTable(turn: number,
                            table: NumberTable,
                            excludedCases: ReadonlyArray<number>,
                            empty: number)
    : TestingHexagonalState
    {
        const height: number = table.length;
        if (height === 0) {
            throw new Error('Cannot create an HexaBoard from an empty table.');
        }
        const width: number = table[0].length;
        return new TestingHexagonalState(turn, table, width, height, excludedCases, empty);
    }
    public constructor(turn: number,
                       public readonly board: NumberTable,
                       public readonly width: number,
                       public readonly height: number,
                       public readonly excludedCases: ReadonlyArray<number>,
                       public readonly empty: number)
    {
        super(turn, board, width, height, excludedCases, empty);
        if (this.excludedCases.length >= (this.height/2)+1) {
            throw new Error('Invalid excluded cases specification for HexaBoard.');
        }
    }
    public setAtUnsafe(coord: Coord, value: number): this {
        const newBoard: number[][] = ArrayUtils.copyBiArray(this.board);
        newBoard[coord.y][coord.x] = value;
        return new TestingHexagonalState(this.turn,
                                         newBoard,
                                         this.width,
                                         this.height,
                                         this.excludedCases,
                                         this.empty) as this;
    }
    public isOnBoard(coord: Coord): boolean {
        if (coord.isNotInRange(this.width, this.height)) {
            return false;
        }
        return this.board[coord.y][coord.x] !== TestingHexagonalState.NONE;
    }
    public numCompare(x: number, y: number): boolean {
        return x === y;
    }
    public equals(other: TestingHexagonalState): boolean {
        return this.equalsT(other, this.numCompare);
    }
}

describe('HexagonalGameState', () => {

    let state: TestingHexagonalState;

    beforeEach(() => {
        state = TestingHexagonalState.empty(7, 7, [3, 2, 1], 0);
    });
    describe('equals', () => {
        it('should consider a board equal to itself', () => {
            expect(state.equals(state)).toBeTrue();
        });
        it('should distinguish different boards due to different contents', () => {
            const otherState: TestingHexagonalState = state.setAt(new Coord(4, 4), 73);
            expect(state.equals(otherState)).toBeFalse();
        });
        it('should distinguish different boards due to different width', () => {
            const board1: TestingHexagonalState = TestingHexagonalState.empty(3, 3, [1], 0);
            const board2: TestingHexagonalState = TestingHexagonalState.empty(5, 3, [1], 0);
            expect(board1.equals(board2)).toBeFalse();
        });
        it('should distinguish different boards due to different width', () => {
            const board1: TestingHexagonalState = TestingHexagonalState.empty(3, 3, [1], 0);
            const board2: TestingHexagonalState = TestingHexagonalState.empty(3, 5, [1], 0);
            expect(board1.equals(board2)).toBeFalse();
        });
        it('should distinguish different boards due to different empty coords', () => {
            const board1: TestingHexagonalState = TestingHexagonalState.empty(3, 3, [1], 0);
            const board2: TestingHexagonalState = TestingHexagonalState.empty(3, 3, [1], 1);
            expect(board1.equals(board2)).toBeFalse();
        });
    });
    describe('getPieceAt', () => {
        it('should fail when accessing coords not on board', () => {
            spyOn(state, 'isOnBoard').and.returnValue(false);
            expect(() => state.getPieceAt(new Coord(0, 0))).toThrow();
        });
        it('should return the right content', () => {
            const state: TestingHexagonalState = TestingHexagonalState.fromTable(1, [[0, 1, 0]], [], 0);
            expect(state.getPieceAt(new Coord(1, 0))).toBe(1);
        });
    });
    describe('setAt', () => {
        it('should fail when setting a coord not on board', () => {
            expect(() => state.setAt(new Coord(10, 5), 5)).toThrow();
        });
        it('should return updated board upon modification', () => {
            const coord: Coord = new Coord(4, 3);
            const updatedState: TestingHexagonalState = state.setAt(coord, 42);
            expect(updatedState.getPieceAt(coord)).toEqual(42);
        });
    });
    describe('forEachCoord', () => {
        it('should iterate over coords with forEachCoord', () => {
            let count: number = 0;
            state.forEachCoord((_coord: Coord, _content: number) => {
                count += 1;
            });
            expect(count).toEqual(37);
        });
    });
    describe('allLines', () => {
        it('should contain 21 different lines', () => {
            const lines: ReadonlyArray<HexaLine> = state.allLines();
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
    describe('getEntrance', () => {
        const state: TestingHexagonalState = TestingHexagonalState.empty(7, 7, [3, 2, 1], 0);
        it('should return the correct entrance for lines with a constant q', () => {
            const line1: HexaLine = HexaLine.constantQ(0);
            expect(state.getEntranceOnLine(line1).equals(new Coord(0, 3))).toBeTrue();

            const line2: HexaLine = HexaLine.constantQ(4);
            expect(state.getEntranceOnLine(line2).equals(new Coord(4, 0))).toBeTrue();
        });
        it('should return the correct entrance for lines with a constant r', () => {
            const line1: HexaLine = HexaLine.constantR(2);
            expect(state.getEntranceOnLine(line1).equals(new Coord(1, 2))).toBeTrue();

            const line2: HexaLine = HexaLine.constantR(4);
            expect(state.getEntranceOnLine(line2).equals(new Coord(0, 4))).toBeTrue();
        });
        it('should return the correct entrance for lines with a constant s', () => {
            const line1: HexaLine = HexaLine.constantS(4);
            expect(state.getEntranceOnLine(line1).equals(new Coord(4, 0))).toBeTrue();

            const line2: HexaLine = HexaLine.constantS(8);
            expect(state.getEntranceOnLine(line2).equals(new Coord(6, 2))).toBeTrue();
        });
    });
});
