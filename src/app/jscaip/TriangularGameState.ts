import { Table } from '../utils/ArrayUtils';
import { Coord } from './Coord';
import { GameStateWithTable } from './GameStateWithTable';
import { TriangularCheckerBoard } from './TriangularCheckerBoard';

export abstract class TriangularGameState<T> extends GameStateWithTable<T> {

    public static getEmptyNeighbors<T>(board: Table<T>, coord: Coord, empty: T): Coord[] {
        const neighboors: Coord[] = [];
        for (const neighboor of TriangularCheckerBoard.getNeighbors(coord)) {
            if (neighboor.isInRange(board[0].length, board.length) &&
                (board[neighboor.y][neighboor.x] === empty)) {
                neighboors.push(neighboor);
            }
        }
        return neighboors;
    }
    public getEmptyNeighboors(coord: Coord, empty: T): Coord[] {
        return TriangularGameState.getEmptyNeighbors(this.board, coord, empty);
    }
}
