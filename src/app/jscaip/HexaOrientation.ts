import { Coord } from './Coord';
import { HexagonalGameState } from './HexagonalGameState';

export abstract class HexaOrientation {
    public readonly startAngle: number;
    public readonly conversionMatrix: [number, number, number, number];
    public readonly inverseConversionMatrix: [number, number, number, number];
}

export class PointyHexaOrientation extends HexaOrientation {
    public static INSTANCE: HexaOrientation = new PointyHexaOrientation();
    public readonly startAngle: number = 0.5;
    public readonly conversionMatrix: [number, number, number, number] =
        [Math.sqrt(3), Math.sqrt(3)/2, 0, 3/2];
    public readonly inverseConversionMatrix: [number, number, number, number] =
        [Math.sqrt(3)/3, -1/3, 0, 2/3];
    private constructor() {
        super();
    }
}

export class FlatHexaOrientation extends HexaOrientation {

    public static INSTANCE: FlatHexaOrientation = new FlatHexaOrientation();

    public readonly startAngle: number = 0;

    public readonly conversionMatrix: [number, number, number, number] =
        [3/2, 0, Math.sqrt(3) / 2, Math.sqrt(3)];

    public readonly inverseConversionMatrix: [number, number, number, number] =
        [2/3, 0, -1/3, Math.sqrt(3)/3];
    private constructor() {
        super();
    }
    public isOnBorder<T>(state: HexagonalGameState<T>, coord: Coord): boolean {
        return this.isOnTopRightBorder(state, coord) ||
            this.isOnRightBorder(state, coord) ||
            this.isOnBottomRightBorder(state, coord) ||
            this.isOnBottomLeftBorder(state, coord) ||
            this.isOnLeftBorder(state, coord) ||
            this.isOnTopLeftBorder(state, coord);
    }
    public isOnTopRightBorder<T>(board: HexagonalGameState<T>, coord: Coord): boolean {
        return coord.y === 0;
    }
    public isOnRightBorder<T>(board: HexagonalGameState<T>, coord: Coord): boolean {
        return coord.x === board.width-1;
    }
    public isOnLeftBorder<T>(board: HexagonalGameState<T>, coord: Coord): boolean {
        return coord.x === 0;
    }
    public isOnBottomLeftBorder<T>(board: HexagonalGameState<T>, coord: Coord): boolean {
        return coord.y === board.height-1;
    }
    public isOnTopLeftBorder<T>(board: HexagonalGameState<T>, coord: Coord): boolean {
        if (board.excludedCases[coord.y] != null) {
            return coord.x === board.excludedCases[coord.y];
        } else if (coord.y === board.excludedCases.length) {
            return coord.x === 0;
        } else {
            return false;
        }
    }
    public isOnBottomRightBorder<T>(board: HexagonalGameState<T>, coord: Coord): boolean {
        if (board.excludedCases[board.height-1 - coord.y] != null) {
            return board.width-1 - coord.x === board.excludedCases[board.height-1 - coord.y];
        } else if (board.height-1 - coord.y === board.excludedCases.length) {
            return coord.x === board.width-1;
        } else {
            return false;
        }
    }
    public getAllBorders<T>(state: HexagonalGameState<T>): Coord[] {
        const coords: Coord[] = [];
        state.forEachCoord((coord: Coord, _content: T) => {
            if (this.isOnBorder(state, coord)) {
                coords.push(coord);
            }
        });
        return coords;
    }
    public isTopCorner<T>(board: HexagonalGameState<T>, coord: Coord): boolean {
        return this.isOnTopLeftBorder(board, coord) && this.isOnTopRightBorder(board, coord);
    }
    public isTopLeftCorner<T>(board: HexagonalGameState<T>, coord: Coord): boolean {
        return this.isOnTopLeftBorder(board, coord) && this.isOnLeftBorder(board, coord);
    }
    public isTopRightCorner<T>(board: HexagonalGameState<T>, coord: Coord): boolean {
        return this.isOnTopRightBorder(board, coord) && this.isOnRightBorder(board, coord);
    }
    public isBottomCorner<T>(board: HexagonalGameState<T>, coord: Coord): boolean {
        return this.isOnBottomLeftBorder(board, coord) && this.isOnBottomRightBorder(board, coord);
    }
    public isBottomLeftCorner<T>(board: HexagonalGameState<T>, coord: Coord): boolean {
        return this.isOnBottomLeftBorder(board, coord) && this.isOnLeftBorder(board, coord);
    }
    public isBottomRightCorner<T>(board: HexagonalGameState<T>, coord: Coord): boolean {
        return this.isOnBottomRightBorder(board, coord) && this.isOnRightBorder(board, coord);
    }
}
