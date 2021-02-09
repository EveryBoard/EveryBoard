import { Coord } from '../coord/Coord';
import { Encoder } from '../encoder';
import { HexaBoard } from './HexaBoard';


describe('HexaBoard', () => {
    const numEncoder: Encoder<number> = new class extends Encoder<number> {
        public maxValue() {
            return 100;
        }
        public encode(t: number): number {
            return t;
        }
        public decode(n: number): number {
            return n;
        }
    };
    let board: HexaBoard<number>;
    beforeEach(() => {
        board = HexaBoard.empty(3, 0, numEncoder);
    });
    describe('empty', () => {
        it('should create empty boards with empty cells', () => {
            expect(board.getAt(new Coord(0, 0))).toEqual(0);
        });
    });

    describe('getAt', () => {
        it('should fail when accessing coords not on board', () => {
            expect(() => board.getAt(new Coord(10, 5))).toThrow();
        });
    });

    describe('setAt', () => {
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

    describe('fromNumberTable and toNumberTable', () => {
        it('should convert to and from NumberTable', () => {
            const board2: HexaBoard<number> = HexaBoard.fromNumberTable(board.toNumberTable(), 0, numEncoder);
            board2.forEachCoord((coord: Coord, content: number) => {
                expect(content).toEqual(board.getAt(coord));
            });
        });
    });
});
