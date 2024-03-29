import { Table } from '../utils/ArrayUtils';
import { Coord } from './Coord';
import { GameStateWithTable } from './GameStateWithTable';
import { TriangularCheckerBoard } from './TriangularCheckerBoard';

export abstract class TriangularGameState<T> extends GameStateWithTable<T> {

    public static getEmptyNeighbors<T>(board: Table<T>, coord: Coord, empty: T): Coord[] {
        const neighbors: Coord[] = [];
        for (const neighbor of TriangularCheckerBoard.getNeighbors(coord)) {
            if (neighbor.isInRange(board[0].length, board.length) &&
                (board[neighbor.y][neighbor.x] === empty)) {
                neighbors.push(neighbor);
            }
        }
        return neighbors;
    }
    public getEmptyNeighbors(coord: Coord, empty: T): Coord[] {
        return TriangularGameState.getEmptyNeighbors(this.board, coord, empty);
    }
}
