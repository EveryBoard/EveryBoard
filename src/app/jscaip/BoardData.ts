import { Coord } from 'src/app/jscaip/Coord';
import { Ordinal } from './Ordinal';
import { Table, TableUtils } from './TableUtils';
import { Debug } from '../utils/Debug';

export class BoardData {

    private constructor(readonly groupIndices: Table<number>,
                        readonly groups: ReadonlyArray<GroupInfos>)
    {
    }

    public static ofBoard<T>(board: Table<T>, groupDatasFactory: GroupDataFactory<T>): BoardData {
        const groupIndices: number[][] = TableUtils.create(board[0].length, board.length, -1);
        const groupsDatas: GroupData<T>[] = [];
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                if (groupIndices[y][x] === -1) {
                    const newGroupEntryPoint: Coord = new Coord(x, y);
                    const newGroupDatas: GroupData<T> =
                        groupDatasFactory.getGroupData(newGroupEntryPoint, board);
                    const groupCoords: Coord[] = newGroupDatas.getCoords();
                    const newGroupIndex: number = groupsDatas.length;
                    for (const coord of groupCoords) {
                        groupIndices[coord.y][coord.x] = newGroupIndex;
                    }
                    groupsDatas.push(newGroupDatas);
                }
            }
        }
        const groupsInfos: GroupInfos[] = [];
        for (const groupDatas of groupsDatas) {
            const coords: Coord[] = groupDatas.getCoords();
            const neighborsEntryPoints: Coord[] = groupDatas.getNeighborsEntryPoints();
            const groupInfos: GroupInfos = new GroupInfos(coords, neighborsEntryPoints);
            groupsInfos.push(groupInfos);
        }
        return new BoardData(groupIndices, groupsInfos);
    }
}

export class GroupInfos {
    public constructor(readonly coords: ReadonlyArray<Coord>,
                       readonly neighborsEntryPoints: ReadonlyArray<Coord>) {}
}

@Debug.log
export abstract class GroupDataFactory<T> {

    public abstract getNewInstance(color: T): GroupData<T>;

    public abstract getDirections(coord: Coord): ReadonlyArray<Ordinal>;

    public getGroupData(coord: Coord, board: Table<T>): GroupData<T> {
        const color: T = board[coord.y][coord.x];
        const groupDatas: GroupData<T> = this.getNewInstance(color);
        return this._getGroupDatas(coord, board, groupDatas);
    }

    private _getGroupDatas(coord: Coord, board: Table<T>, groupDatas: GroupData<T>): GroupData<T> {
        const color: T = board[coord.y][coord.x];
        groupDatas.addPawn(coord, color);
        if (color === groupDatas.color) {
            for (const direction of this.getDirections(coord)) {
                const nextCoord: Coord = coord.getNext(direction);
                if (nextCoord.isInRange(board[0].length, board.length)) {
                    if (groupDatas.contains(nextCoord) === false) {
                        groupDatas = this._getGroupDatas(nextCoord, board, groupDatas);
                    }
                }
            }
        }
        return groupDatas;
    }
}

export abstract class GroupData<T> {

    public constructor(public readonly color: T) {}

    public abstract getCoords(): Coord[];

    public abstract contains(coord: Coord): boolean;

    public abstract addPawn(coord: Coord, color: T): void;

    public abstract getNeighborsEntryPoints(): Coord[];

    public selfContains(coord: Coord): boolean {
        const ownCoords: Coord[] = this.getCoords();
        return ownCoords.some((c: Coord) => c.equals(coord));
    }

    public static insert(list: Coord[], coord: Coord): Coord[] {
        if (list.length === 0) {
            return [coord];
        } else {
            const first: Coord = list[0];
            if (coord.compareTo(first) < 0) {
                return [coord].concat(list);
            } else {
                return list.concat([coord]);
            }
        }
    }

}
