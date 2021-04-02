import { Coord } from '../coord/Coord';
import { HexaBoard } from './HexaBoard';
import { FlatHexaOrientation } from './HexaOrientation';

describe('PointyHexaOrientation', () => {
});

describe('FlatHexaOrientation', () => {
    describe('on a 7x5 board', () => {
        const board: HexaBoard<number> = HexaBoard.empty(7, 5, [2, 1], 0);
        it('should consider (2, 0) to be the on the top left, top right border, and the top corner', () => {
            const coord: Coord = new Coord(2, 0);
            expect(FlatHexaOrientation.INSTANCE.isOnTopLeftBorder(board, coord)).toBeTrue();
            expect(FlatHexaOrientation.INSTANCE.isOnTopRightBorder(board, coord)).toBeTrue();
            expect(FlatHexaOrientation.INSTANCE.isTopCorner(board, coord)).toBeTrue();
        });
        it('should consider (1, 1) to be on the top left border', () => {
            const coord: Coord = new Coord(1, 1);
            expect(FlatHexaOrientation.INSTANCE.isOnTopLeftBorder(board, coord)).toBeTrue();
        });
        it('should consider (3, 0) to be on the top right border', () => {
            const coord: Coord = new Coord(3, 0);
            expect(FlatHexaOrientation.INSTANCE.isOnTopRightBorder(board, coord)).toBeTrue();
        });
        it('should consider (0, 2) to be on the top left and left borders, and the top left corner', () => {
            const coord: Coord = new Coord(0, 2);
            expect(FlatHexaOrientation.INSTANCE.isOnTopLeftBorder(board, coord)).toBeTrue();
            expect(FlatHexaOrientation.INSTANCE.isOnLeftBorder(board, coord)).toBeTrue();
            expect(FlatHexaOrientation.INSTANCE.isTopLeftCorner(board, coord)).toBeTrue();
        });
        it('should consider (0, 3) to be on the left border', () => {
            const coord: Coord = new Coord(0, 3);
            expect(FlatHexaOrientation.INSTANCE.isOnLeftBorder(board, coord)).toBeTrue();
        });
        it('should consider (0, 4) to be on the left and bottom left border, and the bottom left corner', () => {
            const coord: Coord = new Coord(0, 4);
            expect(FlatHexaOrientation.INSTANCE.isOnLeftBorder(board, coord)).toBeTrue();
            expect(FlatHexaOrientation.INSTANCE.isOnBottomLeftBorder(board, coord)).toBeTrue();
            expect(FlatHexaOrientation.INSTANCE.isBottomLeftCorner(board, coord)).toBeTrue();
        });
        it('should consider (2, 4) to be on the bottom left border', () => {
            const coord: Coord = new Coord(2, 4);
            expect(FlatHexaOrientation.INSTANCE.isOnBottomLeftBorder(board, coord)).toBeTrue();
        });
        it('should consider (4, 4) to be on the bottom left and bottom right borders, and the bottom corner', () => {
            const coord: Coord = new Coord(4, 4);
            expect(FlatHexaOrientation.INSTANCE.isOnBottomRightBorder(board, coord)).toBeTrue();
            expect(FlatHexaOrientation.INSTANCE.isOnBottomLeftBorder(board, coord)).toBeTrue();
            expect(FlatHexaOrientation.INSTANCE.isBottomCorner(board, coord)).toBeTrue();
        });
        it('should consider (5, 3) to be on the bottom right border', () => {
            const coord: Coord = new Coord(5, 3);
            expect(FlatHexaOrientation.INSTANCE.isOnBottomRightBorder(board, coord)).toBeTrue();
        });
        it('should consider (6, 2) to be on the bottom right and right border, and the bottom right corner', () => {
            const coord: Coord = new Coord(6, 2);
            expect(FlatHexaOrientation.INSTANCE.isOnBottomRightBorder(board, coord)).toBeTrue();
            expect(FlatHexaOrientation.INSTANCE.isOnRightBorder(board, coord)).toBeTrue();
            expect(FlatHexaOrientation.INSTANCE.isBottomRightCorner(board, coord)).toBeTrue();
        });
        it('should consider (6, 1) to be on the right border', () => {
            const coord: Coord = new Coord(6, 1);
            expect(FlatHexaOrientation.INSTANCE.isOnRightBorder(board, coord)).toBeTrue();
        });
        it('should consider (6, 0) to be on the right and top right border, and the top right corner', () => {
            const coord: Coord = new Coord(6, 0);
            expect(FlatHexaOrientation.INSTANCE.isOnRightBorder(board, coord)).toBeTrue();
            expect(FlatHexaOrientation.INSTANCE.isOnTopRightBorder(board, coord)).toBeTrue();
            expect(FlatHexaOrientation.INSTANCE.isTopRightCorner(board, coord)).toBeTrue();
        });
        // TODO
//             describe('isOnBorder', () => {
//         it('should detect when a coord is on the border', () => {
//             expect(board.isOnBorder(new Coord(-3, 1))).toBeTrue();
//             expect(board.isOnBorder(new Coord(0, -3))).toBeTrue();
//             expect(board.isOnBorder(new Coord(-2, -1))).toBeTrue();
//         });
//         it('should detect when a coord is not on the border', () => {
//             expect(board.isOnBorder(new Coord(-2, 0))).toBeFalse();
//             expect(board.isOnBorder(new Coord(0, 0))).toBeFalse();
//             expect(board.isOnBorder(new Coord(2, -2))).toBeFalse();
//         });
//     });
//     describe('getAllBorders', () => {
//         it('should return 18 borders for a radius of 3', () => {
//             expect(board.getAllBorders().length).toEqual(18);
//         });
//     });

    });
});
