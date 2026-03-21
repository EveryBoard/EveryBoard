import { Set } from '@everyboard/lib';

import { Debug } from '../utils/Debug';

import { Coord } from './Coord';
import { Ordinal } from './Ordinal';
import { Table, TableUtils } from './TableUtils';

export class BoardData {

    private constructor(public readonly groupIndices: Table<number>,
                        public readonly groups: ReadonlyArray<GroupInfos>,
    ) {}

    public static ofBoard<T>(board: Table<T>, groupDatasFactory: GroupDataFactory<T, GroupData<T>>): BoardData {
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
            const neighboringGroups: number[] = groupDatas.getNeighbors()
                .map(
                    (neighboringEntryPoint: Coord) => groupIndices[neighboringEntryPoint.y][neighboringEntryPoint.x],
                );
            const groupInfos: GroupInfos = new GroupInfos(coords, neighborsEntryPoints, new Set(neighboringGroups));
            groupsInfos.push(groupInfos);
        }
        return new BoardData(groupIndices, groupsInfos);
    }
}

/**
 * The main caracteristic of a group is piece of the same type that are connected together.
 */
export class GroupInfos {
    public constructor(
        public readonly coords: ReadonlyArray<Coord>,
        public readonly neighborsEntryPoints: ReadonlyArray<Coord>,
        public readonly neighboringGroups: Set<number>,
    ) {}
}

@Debug.log
export abstract class GroupDataFactory<T, G extends GroupData<T>> {

    public abstract getNewInstance(color: T): G;

    public abstract getDirections(coord: Coord): ReadonlyArray<Ordinal>;

    public getGroupData(coord: Coord, board: Table<T>): G {
        const color: T = board[coord.y][coord.x];
        const groupDatas: G = this.getNewInstance(color);
        return this._getGroupDatas(coord, board, groupDatas);
    }

    private _getGroupDatas(coord: Coord, board: Table<T>, groupDatas: G): G {
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

    public getGroupsDataWhere(board: T[][], condition: (piece: T) => boolean): G[] {
        const groups: G[] = [];
        let coord: Coord;
        let group: G;
        let currentSpace: T;
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                coord = new Coord(x, y);
                currentSpace = board[y][x];
                if (condition(currentSpace)) {
                    if (groups.some((currentGroup: G) => currentGroup.selfContains(coord)) === false) {
                        group = this.getGroupData(coord, board);
                        groups.push(group);
                    }
                }
            }
        }
        return groups;
    }
}

export abstract class GroupData<T> {

    public readonly index: number = Math.floor(Math.random() * 1000);

    public constructor(public readonly color: T) {}

    public abstract getCoords(): Coord[];

    public abstract contains(coord: Coord): boolean;

    public abstract addPawn(coord: Coord, color: T): void;

    public abstract getNeighborsEntryPoints(): Coord[];

    public abstract getNeighbors(): Coord[];

    public selfContains(coord: Coord): boolean {
        const ownCoords: Coord[] = this.getCoords();
        return ownCoords.some((c: Coord) => c.equals(coord));
    }

    public abstract isMonoWrapped(): boolean;

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
