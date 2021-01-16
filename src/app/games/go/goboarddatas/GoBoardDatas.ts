import { GroupInfos } from '../gorules/GoRules';
import { GoPiece, GoPartSlice } from '../GoPartSlice';
import { ArrayUtils, NumberTable } from 'src/app/collectionlib/arrayutils/ArrayUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { GroupDatas } from '../groupdatas/GroupDatas';

export class GoBoardDatas {
    private constructor(
        readonly groupIndexes: NumberTable,
        readonly groups: ReadonlyArray<GroupInfos>,
    ) { }
    public static ofGoPiece(board: GoPiece[][]): GoBoardDatas {
        const groupIndexes: number[][] = ArrayUtils.createBiArray<number>(GoPartSlice.WIDTH, GoPartSlice.HEIGHT, -1);
        const groupsDatas: GroupDatas[] = [];
        for (let y = 0; y < GoPartSlice.HEIGHT; y++) {
            for (let x = 0; x < GoPartSlice.WIDTH; x++) {
                if (groupIndexes[y][x] === -1) {
                    const newGroupEntryPoint: Coord = new Coord(x, y);
                    const newGroupDatas: GroupDatas = GroupDatas.getGroupDatas(newGroupEntryPoint, board);
                    const groupCoords: Coord[] = newGroupDatas.getCoords();
                    const newGroupIndex = groupsDatas.length;
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
        const pieceBoard: GoPiece[][] = GoPartSlice.mapNumberBoard(board);
        return GoBoardDatas.ofGoPiece(pieceBoard);
    }
}
