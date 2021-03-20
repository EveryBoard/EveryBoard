import { Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Coord } from '../../coord/Coord';
import { GamePartSlice } from '../../GamePartSlice';
import { TriangularCheckerBoard } from '../../TriangularCheckerBoard';

export abstract class TriangularGameState extends GamePartSlice {

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
}
