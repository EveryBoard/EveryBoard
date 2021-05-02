import { GroupInfos } from './GoRules';
import { GoPiece, GoPartSlice } from './GoPartSlice';
import { ArrayUtils, NumberTable, Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { GroupDatas } from './GroupDatas';

export class GoBoardDatas {
    private constructor(
        readonly groupIndexes: NumberTable,
        readonly groups: ReadonlyArray<GroupInfos>,
    ) { }
    public static ofGoPiece(board: Table<GoPiece>): GoBoardDatas {
        const groupIndexes: number[][] = ArrayUtils.createBiArray<number>(board[0].length, board.length, -1);
        const groupsDatas: GroupDatas[] = [];
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                if (groupIndexes[y][x] === -1) {
                    const newGroupEntryPoint: Coord = new Coord(x, y);
                    const newGroupDatas: GroupDatas = GroupDatas.getGroupDatas(newGroupEntryPoint, board);
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
        return new GoBoardDatas(groupIndexes, groupsInfos);
    }
    public static ofBoard(board: number[][]): GoBoardDatas {
        const pieceBoard: Table<GoPiece> = GoPartSlice.mapNumberBoard(board);
        return GoBoardDatas.ofGoPiece(pieceBoard);
    }
}
