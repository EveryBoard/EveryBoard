import { Table } from '../utils/ArrayUtils';
import { Coord } from './Coord';
import { RectangularGameState } from './RectangularGameState';
import { TriangularCheckerBoard } from './TriangularCheckerBoard';

export abstract class TriangularGameState<T> extends RectangularGameState<T> {

    public static getEmptyNeighboors<T>(board: Table<T>, coord: Coord, empty: T): Coord[] {
        const neighboors: Coord[] = [];
        for (const neighboor of TriangularCheckerBoard.getNeighboors(coord)) {
            if (neighboor.isInRange(board[0].length, board.length) &&
                (board[neighboor.y][neighboor.x] === empty)) {
                neighboors.push(neighboor);
            }
        }
        return neighboors;
    }
    public getEmptyNeighboors(coord: Coord, empty: T): Coord[] {
        return TriangularGameState.getEmptyNeighboors(this.board, coord, empty);
    }
}
