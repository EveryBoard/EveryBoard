import { ArrayUtils, NumberTable, Table } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { display } from '../utils/utils';
import { Direction } from './Direction';

export class BoardDatas {

    private constructor(readonly groupIndexes: NumberTable,
                        readonly groups: ReadonlyArray<GroupInfos>) { }

    public static ofBoard<T>(board: Table<T>, groupDatasFactory: GroupDatasFactory<T>): BoardDatas {
        const groupIndexes: number[][] = ArrayUtils.createTable<number>(board[0].length, board.length, -1);
        const groupsDatas: GroupDatas<T>[] = [];
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                if (groupIndexes[y][x] === -1) {
                    const newGroupEntryPoint: Coord = new Coord(x, y);
                    const newGroupDatas: GroupDatas<T> =
                        groupDatasFactory.getGroupDatas(newGroupEntryPoint, board);
                    const groupCoords: Coord[] = newGroupDatas.getCoords();
                    const newGroupIndex: number = groupsDatas.length;
                    for (const coord of groupCoords) {
                        groupIndexes[coord.y][coord.x] = newGroupIndex;
                    }
                    groupsDatas.push(newGroupDatas);
                }
            }
        }
        const groupsInfos: GroupInfos[] = [];
        for (const groupDatas of groupsDatas) {
            const coords: Coord[] = groupDatas.getCoords();
            const neighboorsEP: Coord[] = groupDatas.getNeighboorsEntryPoint();
            const groupInfos: GroupInfos = new GroupInfos(coords, neighboorsEP);
            groupsInfos.push(groupInfos);
        }
        return new BoardDatas(groupIndexes, groupsInfos);
    }
}

export class GroupInfos {
    public constructor(readonly coords: ReadonlyArray<Coord>,
                       readonly neighboorsEP: ReadonlyArray<Coord>) { }
}

export abstract class GroupDatasFactory<T> {

    public abstract getNewInstance(color: T): GroupDatas<T>;

    public getGroupDatas(coord: Coord, board: Table<T>): GroupDatas<T> {
        display(GroupDatas.VERBOSE, 'GroupDatas.getGroupDatas(' + coord + ', ' + board + ')');
        const color: T = board[coord.y][coord.x];
        const groupDatas: GroupDatas<T> = this.getNewInstance(color);
        return this._getGroupDatas(coord, board, groupDatas);
    }
    private _getGroupDatas(coord: Coord, board: Table<T>, groupDatas: GroupDatas<T>): GroupDatas<T> {
        display(GroupDatas.VERBOSE, { GroupDatas_getGroupDatas: { groupDatas, coord } });
        const color: T = board[coord.y][coord.x];
        groupDatas.addPawn(coord, color);
        if (color === groupDatas.color) {
            for (const direction of this.getDirections()) {
                const nextCoord: Coord = coord.getNext(direction);
                if (nextCoord.isInRange(board[0].length, board.length)) {
                    if (!groupDatas.contains(nextCoord)) {
                        groupDatas = this._getGroupDatas(nextCoord, board, groupDatas);
                    }
                }
            }
        }
        return groupDatas;
    }
    public abstract getDirections(): ReadonlyArray<Direction>;
}

export abstract class GroupDatas<T> {
    public static VERBOSE: boolean = false;

    constructor(public readonly color: T) {}

    public abstract getCoords(): Coord[];

    public abstract contains(coord: Coord): boolean;

    public abstract addPawn(coord: Coord, color: T): void;

    public abstract getNeighboorsEntryPoint(): Coord[];

    public selfContains(coord: Coord): boolean {
        const ownCoords: Coord[] = this.getCoords();
        return ownCoords.some((c: Coord) => c.equals(coord));
    }
    public static insertAsEntryPoint(list: Coord[], coord: Coord): Coord[] {
        // TODO: rename as it is not always the entry name
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
